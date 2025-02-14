class Database {
  constructor() {
    this.projects = [];
    this.uploads = [];
  }

  async getAllProjects() {
    return this.projects;
  }

  async createProject(project) {
    const newProject = {
      id: Date.now().toString(),
      ...project,
      createdAt: new Date().toISOString()
    };
    this.projects.push(newProject);
    return newProject;
  }

  async deleteProject(id) {
    const index = this.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      this.projects.splice(index, 1);
    }
  }

  async saveUploads(files) {
    const uploads = files.map(file => ({
      id: Date.now().toString(),
      ...file,
      uploadedAt: new Date().toISOString()
    }));
    this.uploads.push(...uploads);
    return uploads;
  }

  async getAllUploads() {
    return this.uploads;
  }
}

module.exports = Database;
