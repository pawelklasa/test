import { useState, useCallback } from 'react';
import { useFeatures } from '../hooks/useFeatures';
import { useProject } from '../ProjectContext';

// AI-powered subtask extraction from feature descriptions
export const useSubtaskExtraction = () => {
  const { selectedProject } = useProject();
  const { addFeature } = useFeatures(selectedProject);

  // Keywords that indicate multiple tasks/requirements
  const taskIndicators = [
    'implement', 'create', 'add', 'build', 'develop', 'design', 'integrate',
    'setup', 'configure', 'establish', 'enable', 'support', 'provide',
    'allow', 'ensure', 'include', 'feature', 'functionality', 'capability',
    'component', 'module', 'system', 'interface', 'api', 'endpoint',
    'validation', 'authentication', 'authorization', 'notification',
    'dashboard', 'report', 'analytics', 'monitoring', 'logging'
  ];

  // Complexity indicators
  const complexityIndicators = [
    'comprehensive', 'advanced', 'sophisticated', 'robust', 'scalable',
    'enterprise', 'full-featured', 'complete', 'integrated', 'automated',
    'real-time', 'multi-', 'cross-', 'end-to-end', 'workflow'
  ];

  // Break down description into potential subtasks
  const extractSubtasks = (description, featureName) => {
    if (!description || description.length < 150) {
      return []; // Too short to need breakdown
    }

    const sentences = description
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);

    const subtasks = [];
    
    // Pattern 1: Bullet points or numbered lists
    const bulletPoints = description.match(/[-•*]\s*(.+?)(?=[-•*]|\n|$)/g);
    if (bulletPoints && bulletPoints.length > 1) {
      bulletPoints.forEach((point, index) => {
        const cleanPoint = point.replace(/^[-•*]\s*/, '').trim();
        if (cleanPoint.length > 15) {
          subtasks.push({
            name: `${featureName} - ${capitalizeFirst(cleanPoint)}`,
            description: cleanPoint,
            type: 'bullet_point',
            priority: index === 0 ? 'Must-Have' : 'Should-Have'
          });
        }
      });
    }

    // Pattern 2: Numbered lists
    const numberedItems = description.match(/\d+\.\s*(.+?)(?=\d+\.|\n|$)/g);
    if (numberedItems && numberedItems.length > 1) {
      numberedItems.forEach((item, index) => {
        const cleanItem = item.replace(/^\d+\.\s*/, '').trim();
        if (cleanItem.length > 15) {
          subtasks.push({
            name: `${featureName} - Step ${index + 1}: ${capitalizeFirst(cleanItem)}`,
            description: cleanItem,
            type: 'numbered_step',
            priority: index < 2 ? 'Must-Have' : 'Should-Have'
          });
        }
      });
    }

    // Pattern 3: Multiple functionality mentions
    const functionalityMatches = [];
    sentences.forEach(sentence => {
      const taskKeywords = taskIndicators.filter(keyword => 
        sentence.toLowerCase().includes(keyword)
      );
      
      if (taskKeywords.length >= 2 || sentence.length > 80) {
        // Check if sentence describes a distinct functionality
        const hasComplexityIndicator = complexityIndicators.some(indicator =>
          sentence.toLowerCase().includes(indicator)
        );
        
        if (hasComplexityIndicator || taskKeywords.length >= 2) {
          functionalityMatches.push(sentence);
        }
      }
    });

    // Create subtasks from functionality matches
    functionalityMatches.forEach((match, index) => {
      if (index < 5) { // Limit to 5 auto-generated subtasks
        const taskName = extractTaskName(match, featureName);
        if (taskName && !subtasks.some(st => st.name === taskName)) {
          subtasks.push({
            name: taskName,
            description: match.trim(),
            type: 'functionality',
            priority: index < 2 ? 'Must-Have' : 'Should-Have'
          });
        }
      }
    });

    // Pattern 4: Component/Module breakdown
    const componentMatches = description.match(/\b(component|module|service|api|interface|dashboard|panel|widget|form|modal|dialog)\b[^.!?]*[.!?]/gi);
    if (componentMatches && componentMatches.length > 1) {
      componentMatches.forEach((match, index) => {
        if (index < 4) {
          const componentName = extractComponentName(match, featureName);
          if (componentName && !subtasks.some(st => st.name === componentName)) {
            subtasks.push({
              name: componentName,
              description: match.trim(),
              type: 'component',
              priority: 'Should-Have'
            });
          }
        }
      });
    }

    return subtasks.slice(0, 8); // Limit total subtasks
  };

  // Extract a meaningful task name from a sentence
  const extractTaskName = (sentence, parentName) => {
    const words = sentence.split(' ');
    const actionWords = ['implement', 'create', 'add', 'build', 'develop', 'design', 'setup', 'configure'];
    
    let taskName = '';
    let foundAction = false;
    
    for (let i = 0; i < words.length && taskName.split(' ').length < 6; i++) {
      const word = words[i].toLowerCase();
      
      if (actionWords.includes(word)) {
        foundAction = true;
        taskName = word;
        continue;
      }
      
      if (foundAction && !['the', 'a', 'an', 'to', 'for', 'with', 'and', 'or'].includes(word)) {
        taskName += ' ' + word;
      }
    }
    
    if (!taskName || taskName.length < 10) {
      // Fallback: use first meaningful part of sentence
      const meaningfulPart = sentence.split(' ').slice(0, 6).join(' ');
      taskName = meaningfulPart;
    }
    
    return `${parentName} - ${capitalizeFirst(taskName.trim())}`;
  };

  // Extract component name
  const extractComponentName = (sentence, parentName) => {
    const componentTypes = ['component', 'module', 'service', 'api', 'interface', 'dashboard', 'panel', 'widget', 'form', 'modal', 'dialog'];
    
    for (const type of componentTypes) {
      const regex = new RegExp(`(\\w+\\s+)?${type}`, 'i');
      const match = sentence.match(regex);
      if (match) {
        const componentName = match[0].trim();
        return `${parentName} - ${capitalizeFirst(componentName)}`;
      }
    }
    
    return null;
  };

  // Capitalize first letter
  const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Analyze if feature needs breakdown
  const analyzeFeatureComplexity = useCallback((feature) => {
    const description = feature.desc || '';
    const name = feature.name || '';
    
    const complexity = {
      score: 0,
      reasons: [],
      needsBreakdown: false,
      suggestedSubtasks: []
    };

    // Length-based analysis
    if (description.length > 200) {
      complexity.score += 3;
      complexity.reasons.push('Long description indicates complex feature');
    }
    
    if (description.length > 400) {
      complexity.score += 2;
      complexity.reasons.push('Very detailed description suggests multiple components');
    }

    // Keyword-based analysis
    const taskKeywordCount = taskIndicators.filter(keyword => 
      description.toLowerCase().includes(keyword)
    ).length;
    
    if (taskKeywordCount > 5) {
      complexity.score += 3;
      complexity.reasons.push(`Multiple task keywords found (${taskKeywordCount})`);
    }

    // Complexity indicator analysis
    const complexityKeywordCount = complexityIndicators.filter(keyword =>
      description.toLowerCase().includes(keyword)
    ).length;
    
    if (complexityKeywordCount > 2) {
      complexity.score += 2;
      complexity.reasons.push(`Complex feature indicators found (${complexityKeywordCount})`);
    }

    // List/structure analysis
    const hasBulletPoints = /[-•*]\s/.test(description);
    const hasNumberedList = /\d+\.\s/.test(description);
    
    if (hasBulletPoints || hasNumberedList) {
      complexity.score += 4;
      complexity.reasons.push('Structured list indicates multiple sub-requirements');
    }

    // Multiple sentence analysis
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length > 5) {
      complexity.score += 2;
      complexity.reasons.push(`Multiple detailed requirements (${sentences.length} sentences)`);
    }

    // Story points analysis (if available)
    if (feature.storyPoints && feature.storyPoints > 8) {
      complexity.score += 2;
      complexity.reasons.push(`High story points (${feature.storyPoints}) suggest complexity`);
    }

    // Determine if breakdown is needed
    complexity.needsBreakdown = complexity.score >= 6;
    
    if (complexity.needsBreakdown) {
      complexity.suggestedSubtasks = extractSubtasks(description, name);
    }

    return complexity;
  }, []); // useCallback with empty dependencies since it only uses the passed feature parameter

  // Create subtasks in database
  const createSubtasks = async (parentFeature, subtasks) => {
    console.log('=== CREATE SUBTASKS CALLED ===');
    console.log('Parent feature:', parentFeature.name);
    console.log('Subtasks to create:', subtasks);
    console.log('Selected project ID:', selectedProject);
    
    const createdSubtasks = [];
    
    if (!selectedProject) {
      console.error('ERROR: No project selected');
      return createdSubtasks;
    }
    
    if (!addFeature) {
      console.error('ERROR: addFeature function not available');
      return createdSubtasks;
    }
    
    for (let i = 0; i < subtasks.length; i++) {
      const subtask = subtasks[i];
      console.log(`\n--- Creating subtask ${i + 1}/${subtasks.length} ---`);
      console.log('Subtask data:', subtask);
      
      try {
        const subtaskData = {
          name: subtask.name,
          desc: subtask.description,
          category: parentFeature.category,
          moscow: subtask.priority,
          targetQuarter: parentFeature.targetQuarter,
          tshirtSize: 'S', // Subtasks are typically smaller
          state: 'Missing',
          goal: parentFeature.goal,
          workflowStatus: 'Planning',
          gapTypes: parentFeature.gapTypes || [],
          
          // Subtask-specific fields
          parentFeatureId: parentFeature.id,
          isSubtask: true,
          subtaskType: subtask.type,
          
          // Default values for required fields
          businessValue: 3,
          technicalComplexity: 2,
          effortRequired: 2,
          storyPoints: 2,
          estimatedBackendHours: 4,
          estimatedFrontendHours: 4,
          estimatedQAHours: 2
        };

        console.log('Calling addFeature with data:', subtaskData);
        const result = await addFeature(subtaskData);
        console.log('addFeature result:', result);
        
        if (result && result.success !== false) {
          const createdSubtask = { ...subtaskData, id: result.id };
          createdSubtasks.push(createdSubtask);
          console.log('✅ Successfully created subtask:', createdSubtask.name);
        } else {
          console.error('❌ Failed to create subtask:', result);
        }
      } catch (error) {
        console.error('❌ Exception creating subtask:', error);
      }
    }
    
    console.log('=== SUBTASK CREATION COMPLETE ===');
    console.log('Total created:', createdSubtasks.length);
    console.log('Created subtasks:', createdSubtasks);
    return createdSubtasks;
  };

  return {
    analyzeFeatureComplexity,
    extractSubtasks,
    createSubtasks
  };
};
