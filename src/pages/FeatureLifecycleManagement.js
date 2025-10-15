import React, { useState, useEffect, useMemo } from 'react';
import { useProject } from '../ProjectContext';
import { useFeatures } from '../hooks/useFeatures';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Divider from '@mui/material/Divider';

// Icons
import AutorenewIcon from '@mui/icons-material/Autorenew';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import { useTheme } from '@mui/material/styles';

function FeatureLifecycleManagement() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { selectedProject } = useProject();
  const { features, updateFeature, loading } = useFeatures(selectedProject);
  
  const [activeTab, setActiveTab] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [lifecycleData, setLifecycleData] = useState({});

  // Lifecycle stages for features
  const lifecycleStages = [
    { id: 'conception', label: 'Conception', color: '#9CA3AF', description: 'Initial idea phase' },
    { id: 'planning', label: 'Planning', color: '#F59E0B', description: 'Requirements & design' },
    { id: 'development', label: 'Development', color: '#3B82F6', description: 'Active development' },
    { id: 'testing', label: 'Testing', color: '#8B5CF6', description: 'QA & validation' },
    { id: 'launched', label: 'Launched', color: '#10B981', description: 'Live in production' },
    { id: 'mature', label: 'Mature', color: '#059669', description: 'Stable & widely adopted' },
    { id: 'declining', label: 'Declining', color: '#DC2626', description: 'Usage decreasing' },
    { id: 'retired', label: 'Retired', color: '#6B7280', description: 'No longer available' }
  ];

  // Success criteria types
  const successCriteriaTypes = [
    'Adoption Rate', 'User Engagement', 'Revenue Impact', 'Performance Metrics',
    'User Satisfaction', 'Support Tickets', 'Usage Frequency', 'Conversion Rate'
  ];

  // Extended lifecycle data (in a real app, this would come from analytics APIs)
  const generateLifecycleData = (feature) => {
    if (lifecycleData[feature.id]) return lifecycleData[feature.id];
    
    const baseData = {
      // Launch metrics
      launchDate: feature.workflowStatus === 'Completed' ? new Date(2024, 8, 15) : null,
      adoptionRate: Math.floor(Math.random() * 80) + 20, // 20-100%
      userEngagement: Math.floor(Math.random() * 90) + 10, // 10-100%
      
      // Performance metrics
      successCriteria: [
        { type: 'Adoption Rate', target: 75, current: Math.floor(Math.random() * 80) + 20 },
        { type: 'User Satisfaction', target: 4.0, current: parseFloat((Math.random() * 2 + 3).toFixed(1)) },
        { type: 'Performance', target: 2000, current: Math.floor(Math.random() * 1000) + 1500 }
      ],
      
      // Timeline
      milestones: [
        { date: '2024-06-15', event: 'Conception', description: 'Initial idea documented' },
        { date: '2024-07-01', event: 'Planning Started', description: 'Requirements gathering' },
        { date: '2024-08-15', event: 'Development', description: 'Development phase began' },
        ...(feature.workflowStatus === 'Completed' ? [
          { date: '2024-09-15', event: 'Launched', description: 'Released to production' }
        ] : [])
      ],
      
      // Analytics
      usageData: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
        users: Math.floor(Math.random() * 1000) + 500,
        engagement: Math.floor(Math.random() * 100) + 50
      })),
      
      // Feedback
      feedback: [
        { date: '2024-10-01', user: 'John D.', rating: 5, comment: 'Great feature, very useful!' },
        { date: '2024-09-28', user: 'Sarah M.', rating: 4, comment: 'Works well, but could be faster' },
        { date: '2024-09-25', user: 'Mike R.', rating: 3, comment: 'Good concept, needs refinement' }
      ],
      
      // Current lifecycle stage
      currentStage: feature.workflowStatus === 'Completed' ? 'launched' : 
                   feature.workflowStatus === 'In Progress' ? 'development' : 'planning'
    };
    
    setLifecycleData(prev => ({ ...prev, [feature.id]: baseData }));
    return baseData;
  };

  // Get features by lifecycle stage
  const getFeaturesByStage = (stageId) => {
    return features.filter(feature => {
      const data = generateLifecycleData(feature);
      return data.currentStage === stageId;
    });
  };

  // Get stage color
  const getStageColor = (stageId) => {
    const stage = lifecycleStages.find(s => s.id === stageId);
    return stage ? stage.color : '#6B7280';
  };

  // Calculate health score
  const calculateHealthScore = (feature) => {
    const data = generateLifecycleData(feature);
    const adoptionScore = (data.adoptionRate / 100) * 30;
    const engagementScore = (data.userEngagement / 100) * 30;
    const criteriaScore = data.successCriteria.reduce((acc, criteria) => {
      const achievement = Math.min(criteria.current / criteria.target, 1);
      return acc + (achievement * 40 / data.successCriteria.length);
    }, 0);
    
    return Math.round(adoptionScore + engagementScore + criteriaScore);
  };

  // Update feature lifecycle stage
  const updateLifecycleStage = (feature, newStage) => {
    const updatedData = { ...lifecycleData[feature.id] };
    updatedData.currentStage = newStage;
    updatedData.milestones.push({
      date: new Date().toISOString().split('T')[0],
      event: `Moved to ${lifecycleStages.find(s => s.id === newStage)?.label}`,
      description: `Lifecycle stage updated`
    });
    
    setLifecycleData(prev => ({ ...prev, [feature.id]: updatedData }));
    setOpenDialog(false);
  };

  // Tab content
  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  // Feature card component
  const FeatureCard = ({ feature, data }) => {
    const healthScore = calculateHealthScore(feature);
    const stage = lifecycleStages.find(s => s.id === data.currentStage);
    
    return (
      <Card sx={{ 
        mb: 2, 
        borderLeft: 4, 
        borderLeftColor: getStageColor(data.currentStage),
        '&:hover': { boxShadow: 3 }
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {feature.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={stage?.label} 
                  size="small" 
                  sx={{ bgcolor: stage?.color, color: 'white' }}
                />
                <Chip 
                  label={feature.category} 
                  size="small" 
                  variant="outlined"
                />
                <Chip 
                  label={`Health: ${healthScore}%`}
                  size="small"
                  icon={healthScore >= 80 ? <CheckCircleIcon /> : healthScore >= 60 ? <WarningIcon /> : <TrendingDownIcon />}
                  color={healthScore >= 80 ? 'success' : healthScore >= 60 ? 'warning' : 'error'}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="View Details">
                <IconButton 
                  size="small" 
                  onClick={() => {
                    setSelectedFeature(feature);
                    setOpenDialog(true);
                  }}
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit Lifecycle">
                <IconButton size="small">
                  <EditIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {/* Metrics Summary */}
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">Adoption</Typography>
              <Typography variant="h6" color="primary">{data.adoptionRate}%</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">Engagement</Typography>
              <Typography variant="h6" color="primary">{data.userEngagement}%</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">Days Live</Typography>
              <Typography variant="h6" color="primary">
                {data.launchDate ? Math.floor((new Date() - data.launchDate) / (1000 * 60 * 60 * 24)) : 'N/A'}
              </Typography>
            </Grid>
          </Grid>
          
          {/* Success Criteria Progress */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
              Success Criteria
            </Typography>
            {data.successCriteria.slice(0, 2).map((criteria, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption">{criteria.type}</Typography>
                  <Typography variant="caption">
                    {criteria.current} / {criteria.target}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((criteria.current / criteria.target) * 100, 100)}
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading lifecycle data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <AutorenewIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Feature Lifecycle Management
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Track your features from conception to retirement with success metrics and health monitoring
        </Typography>
      </Box>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {lifecycleStages.slice(0, 4).map((stage) => {
          const stageFeatures = getFeaturesByStage(stage.id);
          return (
            <Grid item xs={12} sm={6} md={3} key={stage.id}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  bgcolor: stage.color, 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1
                }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    {stageFeatures.length}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {stage.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stage.description}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="All Features" />
          <Tab label="Active Features" />
          <Tab label="Performance Analytics" />
          <Tab label="Retirement Planning" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        {/* All Features with Lifecycle Stages */}
        <Box sx={{ mb: 3 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Stage</InputLabel>
            <Select
              value={filterStatus}
              label="Filter by Stage"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Stages</MenuItem>
              {lifecycleStages.map((stage) => (
                <MenuItem key={stage.id} value={stage.id}>{stage.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3}>
          {features
            .filter(feature => filterStatus === 'all' || generateLifecycleData(feature).currentStage === filterStatus)
            .map((feature) => {
              const data = generateLifecycleData(feature);
              return (
                <Grid item xs={12} md={6} lg={4} key={feature.id}>
                  <FeatureCard feature={feature} data={data} />
                </Grid>
              );
            })
          }
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {/* Active Features (Launched/Mature) */}
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Live Features Performance
        </Typography>
        
        {features
          .filter(feature => ['launched', 'mature'].includes(generateLifecycleData(feature).currentStage))
          .map((feature) => {
            const data = generateLifecycleData(feature);
            const healthScore = calculateHealthScore(feature);
            
            return (
              <Paper key={feature.id} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {feature.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      label={`Health Score: ${healthScore}%`}
                      color={healthScore >= 80 ? 'success' : healthScore >= 60 ? 'warning' : 'error'}
                    />
                    <Chip 
                      label={lifecycleStages.find(s => s.id === data.currentStage)?.label}
                      sx={{ bgcolor: getStageColor(data.currentStage), color: 'white' }}
                    />
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      Success Criteria
                    </Typography>
                    {data.successCriteria.map((criteria, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{criteria.type}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {criteria.current} / {criteria.target}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min((criteria.current / criteria.target) * 100, 100)}
                          color={criteria.current >= criteria.target ? 'success' : 'primary'}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    ))}
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      Recent Feedback
                    </Typography>
                    {data.feedback.slice(0, 3).map((feedback, index) => (
                      <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {feedback.user}
                          </Typography>
                          <Box sx={{ display: 'flex' }}>
                            {Array.from({ length: 5 }, (_, i) => (
                              <StarIcon 
                                key={i} 
                                sx={{ 
                                  fontSize: 12, 
                                  color: i < feedback.rating ? '#FFD700' : '#E0E0E0' 
                                }} 
                              />
                            ))}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {feedback.date}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {feedback.comment}
                        </Typography>
                      </Box>
                    ))}
                  </Grid>
                </Grid>
              </Paper>
            );
          })
        }
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {/* Performance Analytics */}
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Portfolio Performance Analytics
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Feature Health Distribution
              </Typography>
              {['Excellent (80-100%)', 'Good (60-79%)', 'Poor (0-59%)'].map((range, index) => {
                const [min, max] = index === 0 ? [80, 100] : index === 1 ? [60, 79] : [0, 59];
                const count = features.filter(f => {
                  const score = calculateHealthScore(f);
                  return score >= min && score <= max;
                }).length;
                const percentage = features.length ? (count / features.length) * 100 : 0;
                
                return (
                  <Box key={range} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{range}</Typography>
                      <Typography variant="body2">{count} features</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={percentage}
                      color={index === 0 ? 'success' : index === 1 ? 'warning' : 'error'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                );
              })}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Lifecycle Stage Distribution
              </Typography>
              {lifecycleStages.map((stage) => {
                const count = getFeaturesByStage(stage.id).length;
                const percentage = features.length ? (count / features.length) * 100 : 0;
                
                return (
                  <Box key={stage.id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{stage.label}</Typography>
                      <Typography variant="body2">{count} features</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={percentage}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: stage.color
                        }
                      }}
                    />
                  </Box>
                );
              })}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        {/* Retirement Planning */}
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Retirement Planning & Feature Sunset
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Features with declining usage or low health scores may be candidates for retirement
        </Alert>
        
        {features
          .filter(feature => {
            const healthScore = calculateHealthScore(feature);
            const data = generateLifecycleData(feature);
            return healthScore < 60 || data.currentStage === 'declining';
          })
          .map((feature) => {
            const data = generateLifecycleData(feature);
            const healthScore = calculateHealthScore(feature);
            
            return (
              <Paper key={feature.id} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {feature.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.category} • Health Score: {healthScore}%
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" size="small">
                      Mark for Review
                    </Button>
                    <Button variant="outlined" color="error" size="small">
                      Plan Retirement
                    </Button>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Retirement Reasons:</strong> Low adoption rate ({data.adoptionRate}%), 
                  declining user engagement ({data.userEngagement}%)
                </Typography>
                
                <Box sx={{ bgcolor: 'warning.light', p: 2, borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Recommended Actions:</strong> Analyze user feedback, consider feature improvements, 
                    or plan gradual deprecation with user migration strategy.
                  </Typography>
                </Box>
              </Paper>
            );
          })
        }
        
        {features.filter(feature => {
          const healthScore = calculateHealthScore(feature);
          const data = generateLifecycleData(feature);
          return healthScore < 60 || data.currentStage === 'declining';
        }).length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              All Features Healthy
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No features currently require retirement consideration
            </Typography>
          </Paper>
        )}
      </TabPanel>

      {/* Feature Detail Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Feature Lifecycle Details
          {selectedFeature && (
            <Typography variant="subtitle2" color="text.secondary">
              {selectedFeature.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedFeature && (
            <Box>
              {/* Lifecycle Timeline */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Lifecycle Timeline
              </Typography>
              <List>
                {generateLifecycleData(selectedFeature).milestones.map((milestone, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={milestone.event}
                      secondary={`${milestone.date} • ${milestone.description}`}
                    />
                  </ListItem>
                ))}
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Stage Update */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Update Lifecycle Stage
              </Typography>
              <Grid container spacing={2}>
                {lifecycleStages.map((stage) => (
                  <Grid item xs={6} md={4} key={stage.id}>
                    <Button
                      variant={generateLifecycleData(selectedFeature).currentStage === stage.id ? 'contained' : 'outlined'}
                      fullWidth
                      size="small"
                      onClick={() => updateLifecycleStage(selectedFeature, stage.id)}
                      sx={{ 
                        borderColor: stage.color,
                        color: generateLifecycleData(selectedFeature).currentStage === stage.id ? 'white' : stage.color,
                        bgcolor: generateLifecycleData(selectedFeature).currentStage === stage.id ? stage.color : 'transparent'
                      }}
                    >
                      {stage.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FeatureLifecycleManagement;
