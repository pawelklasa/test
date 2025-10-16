import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

class JiraService {
  constructor() {
    this.config = null;
  }

  async loadConfig(projectId) {
    try {
      const configDoc = await getDoc(doc(db, 'projects', projectId, 'integrations', 'jira'));
      if (configDoc.exists()) {
        this.config = configDoc.data();
        return this.config;
      }
      return null;
    } catch (error) {
      console.error('Error loading Jira config:', error);
      throw error;
    }
  }

  async testConnection(config = null) {
    const jiraConfig = config || this.config;
    if (!jiraConfig) throw new Error('No Jira configuration found');

    const auth = btoa(`${jiraConfig.email}:${jiraConfig.apiToken}`);
    
    try {
      const response = await fetch(`${jiraConfig.jiraUrl}/rest/api/3/myself`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errorMessages?.[0] || 'Authentication failed');
      }

      const userData = await response.json();
      return { success: true, user: userData };
    } catch (error) {
      throw new Error(`Connection failed: ${error.message}`);
    }
  }

  async exportFeatureToJira(feature, projectId) {
    if (!this.config) {
      await this.loadConfig(projectId);
    }

    if (!this.config) {
      throw new Error('Jira not configured for this project');
    }

    const auth = btoa(`${this.config.email}:${this.config.apiToken}`);
    
    // Map feature data to Jira issue format
    const issueData = this.mapFeatureToJiraIssue(feature);

    try {
      const response = await fetch(`${this.config.jiraUrl}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(issueData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Jira API Error:', errorData);
        throw new Error(errorData.errors ? 
          Object.values(errorData.errors)[0] : 
          'Failed to create Jira issue'
        );
      }

      const createdIssue = await response.json();
      
      // Update feature with Jira link
      await this.updateFeatureWithJiraInfo(feature.id, projectId, createdIssue);
      
      return {
        success: true,
        issueKey: createdIssue.key,
        issueUrl: `${this.config.jiraUrl}/browse/${createdIssue.key}`,
        issueId: createdIssue.id
      };
    } catch (error) {
      console.error('Error creating Jira issue:', error);
      throw error;
    }
  }

  mapFeatureToJiraIssue(feature) {
    // Build the description with feature details
    let description = feature.description || '';
    
    // Add feature metrics as additional context
    if (feature.storyPoints || feature.technicalComplexity || feature.businessValue) {
      description += '\n\n--- Feature Details ---\n';
      
      if (feature.storyPoints) {
        description += `Story Points: ${feature.storyPoints}\n`;
      }
      
      if (feature.technicalComplexity) {
        description += `Technical Complexity: ${feature.technicalComplexity}/5\n`;
      }
      
      if (feature.businessValue) {
        description += `Business Value: ${feature.businessValue}/5\n`;
      }
      
      if (feature.dependencyRisk) {
        description += `Dependency Risk: ${feature.dependencyRisk}/5\n`;
      }
      
      if (feature.requirementsClarity) {
        description += `Requirements Clarity: ${feature.requirementsClarity}/5\n`;
      }
    }

    // Add gap types if available
    if (feature.gapTypes && feature.gapTypes.length > 0) {
      description += `\nGap Types: ${feature.gapTypes.join(', ')}\n`;
    }

    // Add category
    if (feature.category) {
      description += `Category: ${feature.category}\n`;
    }

    const issueData = {
      fields: {
        project: {
          key: this.config.projectKey
        },
        summary: feature.name,
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: description
                }
              ]
            }
          ]
        },
        issuetype: {
          name: this.config.issueType
        }
      }
    };

    // Add story points if supported and available
    if (feature.storyPoints) {
      // Story points field ID varies by Jira configuration
      // Common field IDs: customfield_10002, customfield_10004, customfield_10016
      issueData.fields.customfield_10002 = feature.storyPoints;
    }

    // Add labels for better organization
    const labels = ['feature-mgmt'];
    if (feature.category) {
      labels.push(feature.category.toLowerCase().replace(/\s+/g, '-'));
    }
    if (feature.workflowStatus) {
      labels.push(feature.workflowStatus.toLowerCase().replace(/\s+/g, '-'));
    }
    issueData.fields.labels = labels;

    // Set priority based on business value
    if (feature.businessValue) {
      const priorityMap = {
        5: 'Highest',
        4: 'High', 
        3: 'Medium',
        2: 'Low',
        1: 'Lowest'
      };
      const priority = priorityMap[feature.businessValue];
      if (priority) {
        issueData.fields.priority = { name: priority };
      }
    }

    return issueData;
  }

  async updateFeatureWithJiraInfo(featureId, projectId, jiraIssue) {
    try {
      const featureRef = doc(db, 'projects', projectId, 'features', featureId);
      await updateDoc(featureRef, {
        jiraKey: jiraIssue.key,
        jiraUrl: `${this.config.jiraUrl}/browse/${jiraIssue.key}`,
        jiraId: jiraIssue.id,
        jiraExportedAt: new Date(),
        lastJiraSync: new Date()
      });
    } catch (error) {
      console.error('Error updating feature with Jira info:', error);
      // Don't throw here - the Jira issue was created successfully
    }
  }

  async exportMultipleFeatures(features, projectId, onProgress) {
    const results = [];
    
    for (let i = 0; i < features.length; i++) {
      const feature = features[i];
      
      try {
        const result = await this.exportFeatureToJira(feature, projectId);
        results.push({ 
          feature: feature.name, 
          success: true, 
          ...result 
        });
        
        if (onProgress) {
          onProgress(i + 1, features.length, { feature: feature.name, success: true });
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        results.push({ 
          feature: feature.name, 
          success: false, 
          error: error.message 
        });
        
        if (onProgress) {
          onProgress(i + 1, features.length, { feature: feature.name, success: false, error: error.message });
        }
      }
    }
    
    return results;
  }

  getJiraUrlForFeature(feature) {
    if (!feature.jiraKey || !this.config) return null;
    return `${this.config.jiraUrl}/browse/${feature.jiraKey}`;
  }

  isFeatureExported(feature) {
    return !!(feature.jiraKey && feature.jiraUrl);
  }
}

// Export singleton instance
export const jiraService = new JiraService();
export default jiraService;
