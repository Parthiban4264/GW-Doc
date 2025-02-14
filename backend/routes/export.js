const express = require('express');
const router = express.Router();
const htmlPdf = require('html-pdf-node');

router.post('/pdf', async (req, res) => {
  try {
    const { html } = req.body;
    
    const options = {
      format: 'A4',
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
    };
    
    const file = { content: html };
    
    const buffer = await htmlPdf.generatePdf(file, options);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=api-documentation.pdf');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

module.exports = router;
