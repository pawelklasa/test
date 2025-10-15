import React, { useState, useEffect, useMemo } from 'react';
import { useProject } from '../ProjectContext';
import { useFeatures } from '../hooks/useFeatures';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import LinearProgress from '@mui/material/LinearProgress';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TimelineIcon from '@mui/icons-material/Timeline';
import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';
import { useTheme } from '@mui/material/styles';

function PortfolioRoadmap() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { selectedProject } = useProject();
  const { features, loading } = useFeatures(selectedProject);
  
  const [viewMode, setViewMode] = useState('quarters'); // 'quarters', 'months', 'years'
  const [groupBy, setGroupBy] = useState('category'); // 'category', 'priority', 'none'
  const [selectedQuarter, setSelectedQuarter] = useState('all');

  // Generate time periods based on view mode
  const timePeriods = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
    
    if (viewMode === 'quarters') {
      const periods = [];
      for (let year = currentYear; year <= currentYear + 2; year++) {
        for (let q = 1; q <= 4; q++) {
          const label = `Q${q} ${year}`;
          const isCurrentQuarter = year === currentYear && q === currentQuarter;
          periods.push({
            id: label,
            label,
            year,
            quarter: q,
            isCurrent: isCurrentQuarter,
            isPast: year < currentYear || (year === currentYear && q < currentQuarter)
          });
        }
      }
      return periods.slice(0, 12); // Show 3 years worth
    } else if (viewMode === 'months') {
      const periods = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let year = currentYear; year <= currentYear + 1; year++) {
        months.forEach((month, index) => {
          const monthNum = index + 1;
          const isCurrentMonth = year === currentYear && monthNum === (new Date().getMonth() + 1);
          periods.push({
            id: `${month}-${year}`,
            label: `${month} ${year}`,
            year,
            month: monthNum,
            isCurrent: isCurrentMonth,
            isPast: year < currentYear || (year === currentYear && monthNum < (new Date().getMonth() + 1))
          });
        });
      }
      return periods.slice(0, 18); // Show 1.5 years
    } else {
      return [{
        id: currentYear.toString(),
        label: currentYear.toString(),
        year: currentYear,
        isCurrent: true,
        isPast: false
      }, {
        id: (currentYear + 1).toString(),
        label: (currentYear + 1).toString(),
        year: currentYear + 1,
        isCurrent: false,
        isPast: false
      }, {
        id: (currentYear + 2).toString(),
        label: (currentYear + 2).toString(),
        year: currentYear + 2,
        isCurrent: false,
        isPast: false
      }];
    }
  }, [viewMode]);

  // Get features for a specific time period
  const getFeaturesForPeriod = (period) => {
    return features.filter(feature => {
      if (!feature.targetQuarter) return false;
      
      const targetQuarter = feature.targetQuarter;
      
      if (viewMode === 'quarters') {
        return targetQuarter === period.id;
      } else if (viewMode === 'months') {
        // Map quarter to months (rough approximation)
        const quarterMonthMap = {
          'Q1': ['Jan', 'Feb', 'Mar'],
          'Q2': ['Apr', 'May', 'Jun'], 
          'Q3': ['Jul', 'Aug', 'Sep'],
          'Q4': ['Oct', 'Nov', 'Dec']
        };
        
        const quarter = targetQuarter.split(' ')[0];
        const year = targetQuarter.split(' ')[1];
        const months = quarterMonthMap[quarter] || [];
        
        return months.some(month => period.id.startsWith(month)) && 
               period.year.toString() === year;
      } else {
        const year = targetQuarter.split(' ')[1];
        return period.year.toString() === year;
      }
    });
  };

  // Group features by selected criteria
  const groupFeatures = (features) => {
    if (groupBy === 'none') {
      return { 'All Features': features };
    }
    
    const groups = {};
    features.forEach(feature => {
      let key;
      if (groupBy === 'category') {
        key = feature.category || 'Uncategorized';
      } else if (groupBy === 'priority') {
        key = feature.moscow || 'No Priority';
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(feature);
    });
    
    return groups;
  };

  // Get color based on feature priority
  const getPriorityColor = (moscow) => {
    switch (moscow) {
      case 'Must-Have': return '#fa709a';
      case 'Should-Have': return '#667eea';
      case 'Could-Have': return '#43e97b';
      case "Won't-Have": return '#bdbdbd';
      default: return '#f59e0b';
    }
  };

  // Get workflow status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#10B981';
      case 'In Progress': return '#3B82F6';
      case 'Planning': return '#F59E0B';
      case 'On Hold': return '#EF4444';
      default: return '#6B7280';
    }
  };

  // Calculate completion percentage for a group of features
  const getCompletionPercentage = (features) => {
    if (!features.length) return 0;
    const completed = features.filter(f => f.workflowStatus === 'Completed').length;
    return Math.round((completed / features.length) * 100);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading roadmap...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <TimelineIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Portfolio Roadmap
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Visualize your feature delivery timeline across quarters and track progress
        </Typography>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              View Mode
            </Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
              fullWidth
            >
              <ToggleButton value="quarters">Quarters</ToggleButton>
              <ToggleButton value="months">Months</ToggleButton>
              <ToggleButton value="years">Years</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Group By</InputLabel>
              <Select
                value={groupBy}
                label="Group By"
                onChange={(e) => setGroupBy(e.target.value)}
              >
                <MenuItem value="none">No Grouping</MenuItem>
                <MenuItem value="category">Category</MenuItem>
                <MenuItem value="priority">Priority</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <CalendarTodayIcon sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {features.length} features planned
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Roadmap Timeline */}
      <Paper sx={{ p: 2 }}>
        {/* Timeline Header */}
        <Box sx={{ 
          display: 'flex', 
          mb: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          pb: 2
        }}>
          <Box sx={{ width: groupBy === 'none' ? 0 : 200, flexShrink: 0 }}>
            {groupBy !== 'none' && (
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {groupBy === 'category' ? 'Categories' : 'Priorities'}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', flex: 1, gap: 1 }}>
            {timePeriods.map((period) => (
              <Box 
                key={period.id}
                sx={{ 
                  flex: 1, 
                  textAlign: 'center',
                  py: 1,
                  bgcolor: period.isCurrent ? 'primary.main' : 'transparent',
                  color: period.isCurrent ? 'primary.contrastText' : 'text.primary',
                  borderRadius: 1,
                  opacity: period.isPast ? 0.6 : 1
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {period.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Timeline Content */}
        {groupBy === 'none' ? (
          // No grouping - show all features in one row
          <Box sx={{ display: 'flex', gap: 1, minHeight: 120 }}>
            {timePeriods.map((period) => {
              const periodFeatures = getFeaturesForPeriod(period);
              return (
                <Box 
                  key={period.id}
                  sx={{ 
                    flex: 1, 
                    bgcolor: period.isCurrent ? 'action.selected' : 'background.default',
                    borderRadius: 1,
                    p: 1,
                    minHeight: 100,
                    border: 1,
                    borderColor: period.isCurrent ? 'primary.main' : 'divider',
                    opacity: period.isPast ? 0.7 : 1
                  }}
                >
                  {periodFeatures.map((feature, index) => (
                    <Card 
                      key={feature.id}
                      sx={{ 
                        mb: 1, 
                        borderLeft: 4,
                        borderLeftColor: getPriorityColor(feature.moscow),
                        '&:hover': { boxShadow: 2 }
                      }}
                    >
                      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                          {feature.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                          <Chip 
                            label={feature.moscow || 'No Priority'} 
                            size="small" 
                            sx={{ 
                              fontSize: '0.65rem',
                              height: 16,
                              bgcolor: getPriorityColor(feature.moscow),
                              color: 'white'
                            }}
                          />
                          <Chip 
                            label={feature.workflowStatus || 'Planning'} 
                            size="small" 
                            sx={{ 
                              fontSize: '0.65rem',
                              height: 16,
                              bgcolor: getStatusColor(feature.workflowStatus),
                              color: 'white'
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                  {periodFeatures.length === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No features planned
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        ) : (
          // With grouping - show swimlanes
          (() => {
            const allFeatures = features.filter(f => f.targetQuarter);
            const groupedFeatures = groupFeatures(allFeatures);
            
            return Object.entries(groupedFeatures).map(([groupName, groupFeatures]) => (
              <Box key={groupName} sx={{ mb: 3 }}>
                {/* Group Header */}
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Box sx={{ width: 200, flexShrink: 0, pr: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {groupName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {groupFeatures.length} features • {getCompletionPercentage(groupFeatures)}% complete
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={getCompletionPercentage(groupFeatures)}
                      sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flex: 1, gap: 1 }}>
                    {timePeriods.map((period) => {
                      const periodFeatures = getFeaturesForPeriod(period).filter(f => 
                        groupFeatures.some(gf => gf.id === f.id)
                      );
                      
                      return (
                        <Box 
                          key={period.id}
                          sx={{ 
                            flex: 1, 
                            bgcolor: period.isCurrent ? 'action.selected' : 'background.default',
                            borderRadius: 1,
                            p: 1,
                            minHeight: 80,
                            border: 1,
                            borderColor: period.isCurrent ? 'primary.main' : 'divider',
                            opacity: period.isPast ? 0.7 : 1
                          }}
                        >
                          {periodFeatures.map((feature) => (
                            <Card 
                              key={feature.id}
                              sx={{ 
                                mb: 1, 
                                borderLeft: 4,
                                borderLeftColor: getPriorityColor(feature.moscow),
                                '&:hover': { boxShadow: 2 }
                              }}
                            >
                              <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                                  {feature.name}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                  <Chip 
                                    label={feature.workflowStatus || 'Planning'} 
                                    size="small" 
                                    sx={{ 
                                      fontSize: '0.6rem',
                                      height: 14,
                                      bgcolor: getStatusColor(feature.workflowStatus),
                                      color: 'white'
                                    }}
                                  />
                                </Box>
                              </CardContent>
                            </Card>
                          ))}
                          {periodFeatures.length === 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              —
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            ));
          })()
        )}
      </Paper>

      {/* Legend */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          Legend
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
              Priority Colors
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[
                { label: 'Must-Have', color: '#fa709a' },
                { label: 'Should-Have', color: '#667eea' },
                { label: 'Could-Have', color: '#43e97b' },
                { label: "Won't-Have", color: '#bdbdbd' }
              ].map(({ label, color }) => (
                <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: color, borderRadius: 0.5 }} />
                  <Typography variant="caption">{label}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
              Status Colors
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[
                { label: 'Completed', color: '#10B981' },
                { label: 'In Progress', color: '#3B82F6' },
                { label: 'Planning', color: '#F59E0B' },
                { label: 'On Hold', color: '#EF4444' }
              ].map(({ label, color }) => (
                <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: color, borderRadius: 0.5 }} />
                  <Typography variant="caption">{label}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default PortfolioRoadmap;
