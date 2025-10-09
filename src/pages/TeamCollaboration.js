import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import SendIcon from '@mui/icons-material/Send';

function TeamCollaboration() {
  const [comment, setComment] = useState('');

  const teamMembers = [
    { name: 'Sarah Johnson', role: 'Product Manager', avatar: 'SJ', color: '#667eea' },
    { name: 'Mike Chen', role: 'Developer', avatar: 'MC', color: '#f093fb' },
    { name: 'Emily Davis', role: 'Designer', avatar: 'ED', color: '#4facfe' },
    { name: 'Alex Kumar', role: 'Analyst', avatar: 'AK', color: '#43e97b' }
  ];

  const activities = [
    { user: 'Sarah Johnson', action: 'updated', item: 'Mobile App Feature', time: '2 hours ago' },
    { user: 'Mike Chen', action: 'commented on', item: 'API Documentation', time: '4 hours ago' },
    { user: 'Emily Davis', action: 'completed', item: 'User Onboarding Flow', time: '1 day ago' }
  ];

  const activeProjects = [
    { name: 'Q4 Feature Roadmap', members: 4, progress: 65 },
    { name: 'UX Improvements', members: 3, progress: 40 },
    { name: 'Performance Optimization', members: 2, progress: 85 }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        Team Collaboration
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Work together seamlessly to prioritize and close gaps faster
      </Typography>

      <Grid container spacing={3}>
        {/* Team Members */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Team Members
            </Typography>
            <Box sx={{ mt: 2 }}>
              {teamMembers.map((member, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                    p: 1,
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  <Avatar sx={{ bgcolor: member.color }}>{member.avatar}</Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {member.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {member.role}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
              Invite Team Member
            </Button>
          </Paper>
        </Grid>

        {/* Activity Feed & Projects */}
        <Grid item xs={12} md={8}>
          {/* Active Projects */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Projects
            </Typography>
            <Box sx={{ mt: 2 }}>
              {activeProjects.map((project, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {project.name}
                      </Typography>
                      <AvatarGroup max={3}>
                        {teamMembers.slice(0, project.members).map((member, i) => (
                          <Avatar key={i} sx={{ bgcolor: member.color, width: 32, height: 32, fontSize: '0.875rem' }}>
                            {member.avatar}
                          </Avatar>
                        ))}
                      </AvatarGroup>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ flex: 1, height: 8, bgcolor: '#e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
                        <Box sx={{ width: `${project.progress}%`, height: '100%', bgcolor: '#667eea' }} />
                      </Box>
                      <Typography variant="caption">{project.progress}%</Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>

          {/* Activity Feed */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ mt: 2 }}>
              {activities.map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    mb: 1,
                    bgcolor: '#f5f5f5',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body2">
                    <strong>{activity.user}</strong> {activity.action}{' '}
                    <Chip label={activity.item} size="small" sx={{ mx: 0.5 }} />
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activity.time}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Comment Box */}
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Add a comment or mention a team member with @"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                sx={{ mt: 2 }}
                onClick={() => setComment('')}
              >
                Post Comment
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default TeamCollaboration;
