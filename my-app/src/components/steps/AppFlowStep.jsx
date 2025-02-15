import React, { useState, useEffect } from "react";
import useLocalStorage from "../../hooks/useLocalStorage";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { marked } from "marked";
import {
  generateRequirementsFromDescription,
  generateAPIDocumentation,
} from "../../services/openai";

const DraggableScreen = ({ id, index, image, description, moveScreen }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "screen",
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "screen",
    hover: (item) => {
      if (item.index !== index) {
        moveScreen(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`p-4 bg-white rounded-lg shadow ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <img
        src={image.preview}
        alt={image.name}
        className="w-full h-32 object-cover rounded"
      />
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
};

function AppFlowStep({ projectId, onNext, onBack }) {
  const [images] = useLocalStorage(`project-${projectId}-images`, []);
  const [descriptions] = useLocalStorage(
    `project-${projectId}-descriptions`,
    {}
  );
  const [requirements] = useLocalStorage(
    `project-${projectId}-requirements`,
    {}
  );
  const [screenOrder, setScreenOrder] = useLocalStorage(
    `project-${projectId}-screen-order`,
    images.map((img) => img.id)
  );
  const [flowDocument, setFlowDocument] = useLocalStorage(
    `project-${projectId}-flow-document`,
    ""
  );
  const [loading, setLoading] = useState(false);

  // Filter out any invalid image IDs and ensure we have valid images
  const orderedImages = screenOrder
    .map((id) => images.find((img) => img.id === id))
    .filter((image) => image && image.preview);

  const moveScreen = (fromIndex, toIndex) => {
    const newOrder = [...screenOrder];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    setScreenOrder(newOrder);
  };

  const generateAppFlow = async () => {
    setLoading(true);
    try {
      const orderedScreens = screenOrder
        .map((id) => ({
          image: images.find((img) => img.id === id),
          description: descriptions[id],
          requirements: requirements[id],
        }))
        .filter((screen) => screen.image);

      // Create a detailed flow description based on the actual screen data
      const flowDescription = orderedScreens
        .map((screen, index) => {
          // Get the actual description and requirements for this screen
          const screenDescription = descriptions[screen.image.id] || "";
          const screenRequirements = requirements[screen.image.id] || "";

          return [
            `# ${index + 1}. ${screen.image.name}`,
            "",
            "## Screen Description",
            screenDescription,
            "",
            "## Requirements",
            screenRequirements,
            "",
            "## Flow Connections",
            index === 0
              ? "- Entry point to the application"
              : `- Connected from: ${orderedScreens[index - 1].image.name}`,
            index < orderedScreens.length - 1
              ? `- Leads to: ${orderedScreens[index + 1].image.name}`
              : "- Exit point of the flow",
            "",
            "---",
          ].join("\n");
        })
        .join("\n");

      const prompt = `Based on the following UI screens and their descriptions, generate a comprehensive application flow document that describes the user journey through the application. Focus on the interactions between screens, data flow, and user actions.\n\nScreen Details:\n\n${flowDescription}`;

      const response = await generateRequirementsFromDescription(
        "Application Flow",
        prompt
      );

      setFlowDocument(response);
    } catch (error) {
      console.error("Failed to generate app flow:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Create App Flow</h2>
        <p className="mt-1 text-sm text-gray-500">
          Arrange screens in order and generate the application flow
          documentation
        </p>
      </div>

      <DndProvider backend={HTML5Backend}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orderedImages.map((image, index) => (
            <DraggableScreen
              key={image.id}
              id={image.id}
              index={index}
              image={image}
              description={descriptions[image.id]}
              moveScreen={moveScreen}
            />
          ))}
        </div>
      </DndProvider>

      {!flowDocument && (
        <div className="flex justify-center">
          <button
            onClick={generateAppFlow}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate App Flow Document"}
          </button>
        </div>
      )}

      {flowDocument && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h3 className="text-xl font-semibold text-gray-900">Application Flow</h3>
          </div>
          <div className="p-6 bg-white">
            <div 
              className="prose max-w-none
                prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-8 prose-h1:mt-0 prose-h1:text-gray-900
                prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-6 prose-h2:mt-12 prose-h2:text-gray-900
                prose-h3:text-xl prose-h3:font-medium prose-h3:mb-4 prose-h3:mt-8 prose-h3:text-gray-900
                prose-p:text-base prose-p:leading-7 prose-p:mb-6 prose-p:text-gray-600
                prose-ul:my-6 prose-ul:pl-8 prose-ul:list-disc prose-ul:text-gray-600
                prose-ol:my-6 prose-ol:pl-8 prose-ol:list-decimal prose-ol:text-gray-600
                prose-li:my-2 prose-li:pl-2
                [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              dangerouslySetInnerHTML={{ 
                __html: marked(flowDocument, {
                  breaks: true,
                  gfm: true
                }) 
              }}
            />
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Previous Step
        </button>
        <button
          onClick={() => {
            // Update current step in project
            const projects = JSON.parse(
              localStorage.getItem("projects") || "[]"
            );
            const updatedProjects = projects.map((p) =>
              p.id === projectId ? { ...p, currentStep: "api" } : p
            );
            localStorage.setItem("projects", JSON.stringify(updatedProjects));

            onNext && onNext("api");
          }}
          disabled={!flowDocument}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}

export default AppFlowStep;
