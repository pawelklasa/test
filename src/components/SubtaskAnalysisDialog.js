import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  LinearProgress,
  Divider,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Psychology as PsychologyIcon,
  AutoFixHigh as AutoFixHighIcon,
  TaskAlt as TaskAltIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useSubtaskExtraction } from '../hooks/useSubtaskExtraction';

const SubtaskAnalysisDialog = ({ open, onClose, feature, onSubtasksCreated }) => {
  const { analyzeFeatureComplexity, createSubtasks } = useSubtaskExtraction();
  const [analysis, setAnalysis] = useState(null);
  const [selectedSubtasks, setSelectedSubtasks] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  useEffect(() => {
    if (feature && open) {
      const complexityAnalysis = analyzeFeatureComplexity(feature);
      setAnalysis(complexityAnalysis);
      
      // Pre-select high-priority subtasks
      const highPrioritySubtasks = complexityAnalysis.suggestedSubtasks
        .filter(st => st.priority === 'Must-Have')
        .map((_, index) => index);
      setSelectedSubtasks(highPrioritySubtasks);
    }
  }, [feature, open, analyzeFeatureComplexity]);

  const handleSubtaskSelection = (index, checked) => {
    if (checked) {
      setSelectedSubtasks([...selectedSubtasks, index]);
    } else {
      setSelectedSubtasks(selectedSubtasks.filter(i => i !== index));
    }
  };

  const handleCreateSubtasks = async () => {
    if (!analysis || selectedSubtasks.length === 0) return;

    setIsCreating(true);
    try {
      const subtasksToCreate = selectedSubtasks.map(index => analysis.suggestedSubtasks[index]);
      const createdSubtasks = await createSubtasks(feature, subtasksToCreate);
      
      onSubtasksCreated(createdSubtasks);
      onClose();
    } catch (error) {
      console.error('Error creating subtasks:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getComplexityColor = (score) => {
    if (score >= 8) return 'error';
    if (score >= 6) return 'warning';
    if (score >= 4) return 'info';
    return 'success';
  };

  const getComplexityLabel = (score) => {
    if (score >= 8) return 'Very Complex';
    if (score >= 6) return 'Complex';
    if (score >= 4) return 'Moderate';
    return 'Simple';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Must-Have': return 'error';
      case 'Should-Have': return 'warning';
      case 'Could-Have': return 'info';
      case 'Won\'t-Have': return 'default';
      default: return 'default';
    }
  };

  const getSubtaskTypeIcon = (type) => {
    switch (type) {
      case 'bullet_point': return '•';
      case 'numbered_step': return '#';
      case 'functionality': return '⚙️';
      case 'component': return '🧩';
      default: return '📋';
    }
  };

  if (!analysis) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PsychologyIcon color="primary" />
          <Typography variant="h6">
            Smart Subtask Analysis: {feature?.name}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Complexity Analysis */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <AutoFixHighIcon color="primary" />
              <Typography variant="h6">Complexity Analysis</Typography>
              <Chip 
                label={getComplexityLabel(analysis.score)}
                color={getComplexityColor(analysis.score)}
                variant="outlined"
              />
              <Typography variant="body2" color="text.secondary">
                Score: {analysis.score}/10
              </Typography>
            </Box>

            <LinearProgress 
              variant="determinate" 
              value={(analysis.score / 10) * 100} 
              color={getComplexityColor(analysis.score)}
              sx={{ mb: 2, height: 8, borderRadius: 4 }}
            />

            {analysis.needsBreakdown ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  This feature appears complex and would benefit from being broken down into smaller subtasks.
                </Typography>
              </Alert>
            ) : (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  This feature appears to be well-scoped and may not need breakdown.
                </Typography>
              </Alert>
            )}

            <Accordion expanded={showFullAnalysis} onChange={() => setShowFullAnalysis(!showFullAnalysis)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Analysis Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Complexity Factors:</Typography>
                  {analysis.reasons.map((reason, index) => (
                    <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                      <InfoIcon fontSize="small" color="info" />
                      <Typography variant="body2">{reason}</Typography>
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>

        {/* Suggested Subtasks */}
        {analysis.suggestedSubtasks.length > 0 ? (
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <TaskAltIcon color="primary" />
                <Typography variant="h6">
                  Suggested Subtasks ({analysis.suggestedSubtasks.length})
                </Typography>
                <Button
                  size="small"
                  onClick={() => {
                    const allIndexes = analysis.suggestedSubtasks.map((_, index) => index);
                    setSelectedSubtasks(selectedSubtasks.length === allIndexes.length ? [] : allIndexes);
                  }}
                >
                  {selectedSubtasks.length === analysis.suggestedSubtasks.length ? 'Deselect All' : 'Select All'}
                </Button>
              </Box>

              <Grid container spacing={2}>
                {analysis.suggestedSubtasks.map((subtask, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        borderColor: selectedSubtasks.includes(index) ? 'primary.main' : 'divider',
                        backgroundColor: selectedSubtasks.includes(index) ? 'primary.50' : 'background.paper'
                      }}
                    >
                      <CardContent sx={{ pb: 2 }}>
                        <Box display="flex" alignItems="flex-start" gap={1}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectedSubtasks.includes(index)}
                                onChange={(e) => handleSubtaskSelection(index, e.target.checked)}
                              />
                            }
                            label=""
                            sx={{ mr: 0, mt: -1 }}
                          />
                          <Box flex={1}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Typography variant="body2" component="span">
                                {getSubtaskTypeIcon(subtask.type)}
                              </Typography>
                              <Chip 
                                label={subtask.priority}
                                size="small"
                                color={getPriorityColor(subtask.priority)}
                                variant="outlined"
                              />
                              <Chip 
                                label={subtask.type.replace('_', ' ')}
                                size="small"
                                variant="outlined"
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </Box>
                            
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                              {subtask.name}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary">
                              {subtask.description}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {selectedSubtasks.length > 0 && (
                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    {selectedSubtasks.length} subtask(s) selected for creation. 
                    These will be created as separate features under the same category with appropriate sizing and priorities.
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        ) : (
          <Alert severity="info">
            <Typography variant="body2">
              No subtasks suggested. This feature appears to be well-scoped or the description doesn't contain sufficient detail for automatic breakdown.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose} disabled={isCreating}>
          Cancel
        </Button>
        
        {analysis.suggestedSubtasks.length > 0 && (
          <Button
            variant="contained"
            onClick={handleCreateSubtasks}
            disabled={selectedSubtasks.length === 0 || isCreating}
            startIcon={isCreating ? <LinearProgress size={20} /> : <TaskAltIcon />}
          >
            {isCreating ? 'Creating...' : `Create ${selectedSubtasks.length} Subtask(s)`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SubtaskAnalysisDialog;
