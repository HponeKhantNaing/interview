const fs = require("fs");
const path = require("path");

function extractAvailableTopics() {
  try {
    const datasetPath = path.join(__dirname, "dataset_coding.json");
    
    if (!fs.existsSync(datasetPath)) {
      console.error(`Dataset file not found: ${datasetPath}`);
      return [];
    }
    
    const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf-8"));
    console.log(`Loaded ${dataset.length} questions from dataset`);
    
    // Extract all unique topics
    const allTopics = new Set();
    
    dataset.forEach(question => {
      if (question.topics && Array.isArray(question.topics)) {
        question.topics.forEach(topic => {
          if (topic && topic.trim()) {
            allTopics.add(topic.trim());
          }
        });
      }
    });
    
    // Convert to sorted array
    const availableTopics = Array.from(allTopics).sort();
    
    console.log(`Found ${availableTopics.length} unique topics`);
    console.log("Available topics:", availableTopics);
    
    return availableTopics;
  } catch (error) {
    console.error("Error extracting topics:", error);
    return [];
  }
}

// Export for use in other files
module.exports = { extractAvailableTopics };

// Run directly if called from command line
if (require.main === module) {
  extractAvailableTopics();
} 