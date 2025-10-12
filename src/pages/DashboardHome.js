import React, { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import { useProject } from '../ProjectContext';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFeatures } from '../hooks/useFeatures';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';

const targetQuarters = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'];
const moscowOptions = ['Must-Have', 'Should-Have', 'Could-Have', "Won't-Have"];
const companyGoals = [
  'Reduce Churn by 5%',
  'Expand to EMEA',
  'Increase NPS',
  'Improve Onboarding',
  'Other'
];
const tshirtSizes = ['S', 'M', 'L', 'XL'];
const currentStates = ['Missing', 'Partial Endpoints', 'Live in Prod'];
const gapTypeOptions = ['Documentation/Training', 'Technology/Tech Debt', 'Process', 'Resources'];

function DashboardHome() {
  // Replace local state with Firestore features
  // Use selectedProject from ProjectContext (top nav dropdown)
  const { selectedProject } = useProject();
  const { features, addFeature, deleteFeature, updateFeature, loading } = useFeatures(selectedProject);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({
    name: '',
    desc: '',
    targetQuarter: '',
    moscow: '',
    goal: '',
    tshirtSize: '',
    state: '',
    gapTypes: [],
    dependencies: ''
  });
  const [editingId, setEditingId] = useState(null);

  const handleAddFeature = () => {
    if (editingId) {
      // Update existing feature
      updateFeature(editingId, form);
    } else {
      // Add new feature
      addFeature(form);
    }
    setForm({
      name: '', desc: '', targetQuarter: '', moscow: '', goal: '', tshirtSize: '', state: '', gapTypes: [], dependencies: ''
    });
    setEditingId(null);
    setOpenDialog(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button variant="contained" onClick={() => setOpenDialog(true)} sx={{ mb: 2 }}>
        Add Feature
      </Button>
      {loading ? (
        <Typography>Loading features...</Typography>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2} sx={{ display: 'flex' }}>
            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
              {features.filter((_, i) => i % 2 === 0).map((f, idx) => {
                let borderColor = '#e0e0e0';
                if (f.moscow === 'Must-Have') borderColor = '#fa709a';
                else if (f.moscow === 'Should-Have') borderColor = '#667eea';
                else if (f.moscow === 'Could-Have') borderColor = '#43e97b';
                else if (f.moscow === "Won't-Have") borderColor = '#bdbdbd';
                return (
                  <Card key={f.id || idx} sx={{ height: 220, display: 'flex', flexDirection: 'column', boxShadow: 3, borderRadius: 3, borderLeft: `6px solid ${borderColor}`, bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: 2, pb: 2, flex: 1, width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', flex: 1 }}>{f.name}</Typography>
                        <Box>
                          <IconButton size="small" onClick={() => {
                            setForm({
                              name: f.name || '',
                              desc: f.desc || '',
                              targetQuarter: f.targetQuarter || '',
                              moscow: f.moscow || '',
                              goal: f.goal || '',
                              tshirtSize: f.tshirtSize || '',
                              state: f.state || '',
                              gapTypes: Array.isArray(f.gapTypes) ? f.gapTypes : [],
                              dependencies: f.dependencies || ''
                            });
                            setEditingId(f.id);
                            setOpenDialog(true);
                          }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => deleteFeature(f.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 400 }}>{f.desc}</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                        <Chip label={f.moscow} size="small" sx={{ bgcolor: borderColor, color: 'white', fontWeight: 600 }} />
                        <Chip label={f.targetQuarter} size="small" />
                        <Chip label={f.goal} size="small" />
                        <Chip label={f.tshirtSize} size="small" />
                        <Chip label={f.state} size="small" />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Gap: {f.gapTypes && f.gapTypes.join(', ')}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Dependencies: {f.dependencies}</Typography>
                    </CardContent>
                  </Card>
                );
              })}
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
              {features.filter((_, i) => i % 2 === 1).map((f, idx) => {
                let borderColor = '#e0e0e0';
                if (f.moscow === 'Must-Have') borderColor = '#fa709a';
                else if (f.moscow === 'Should-Have') borderColor = '#667eea';
                else if (f.moscow === 'Could-Have') borderColor = '#43e97b';
                else if (f.moscow === "Won't-Have") borderColor = '#bdbdbd';
                return (
                  <Card key={f.id || idx} sx={{ height: 220, display: 'flex', flexDirection: 'column', boxShadow: 3, borderRadius: 3, borderLeft: `6px solid ${borderColor}`, bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: 2, pb: 2, flex: 1, width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', flex: 1 }}>{f.name}</Typography>
                        <Box>
                          <IconButton size="small" onClick={() => {
                            setForm({
                              name: f.name || '',
                              desc: f.desc || '',
                              targetQuarter: f.targetQuarter || '',
                              moscow: f.moscow || '',
                              goal: f.goal || '',
                              tshirtSize: f.tshirtSize || '',
                              state: f.state || '',
                              gapTypes: Array.isArray(f.gapTypes) ? f.gapTypes : [],
                              dependencies: f.dependencies || ''
                            });
                            setEditingId(f.id);
                            setOpenDialog(true);
                          }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => deleteFeature(f.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 400 }}>{f.desc}</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                        <Chip label={f.moscow} size="small" sx={{ bgcolor: borderColor, color: 'white', fontWeight: 600 }} />
                        <Chip label={f.targetQuarter} size="small" />
                        <Chip label={f.goal} size="small" />
                        <Chip label={f.tshirtSize} size="small" />
                        <Chip label={f.state} size="small" />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Gap: {f.gapTypes && f.gapTypes.join(', ')}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Dependencies: {f.dependencies}</Typography>
                    </CardContent>
                  </Card>
                );
              })}
            </Grid>
          </Grid>
        </Box>
      )}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Feature' : 'Add Feature'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Feature Name"
            fullWidth
            required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={form.desc}
            onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Target Quarter</InputLabel>
            <Select
              value={form.targetQuarter}
              label="Target Quarter"
              onChange={e => setForm(f => ({ ...f, targetQuarter: e.target.value }))}
            >
              {targetQuarters.map(q => <MenuItem key={q} value={q}>{q}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>MoSCoW</InputLabel>
            <Select
              value={form.moscow}
              label="MoSCoW"
              onChange={e => setForm(f => ({ ...f, moscow: e.target.value }))}
            >
              {moscowOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Company Goal</InputLabel>
            <Select
              value={form.goal}
              label="Company Goal"
              onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
            >
              {companyGoals.map(goal => <MenuItem key={goal} value={goal}>{goal}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>T-Shirt Sizing (Effort)</InputLabel>
            <Select
              value={form.tshirtSize}
              label="T-Shirt Sizing (Effort)"
              onChange={e => setForm(f => ({ ...f, tshirtSize: e.target.value }))}
            >
              {tshirtSizes.map(size => <MenuItem key={size} value={size}>{size}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Current State</InputLabel>
            <Select
              value={form.state}
              label="Current State"
              onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
            >
              {currentStates.map(state => <MenuItem key={state} value={state}>{state}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ mb: 1 }}>Gap Type (Root Cause)</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {gapTypeOptions.map(option => (
                <Chip
                  key={option}
                  label={option}
                  color={form.gapTypes.includes(option) ? 'primary' : 'default'}
                  onClick={() => setForm(f => ({
                    ...f,
                    gapTypes: f.gapTypes.includes(option)
                      ? f.gapTypes.filter(g => g !== option)
                      : [...f.gapTypes, option]
                  }))}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>
          <TextField
            label="Dependencies / Notes"
            fullWidth
            multiline
            rows={2}
            value={form.dependencies}
            onChange={e => setForm(f => ({ ...f, dependencies: e.target.value }))}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            setEditingId(null);
            setForm({
              name: '', desc: '', targetQuarter: '', moscow: '', goal: '', tshirtSize: '', state: '', gapTypes: [], dependencies: ''
            });
          }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddFeature} disabled={!form.name.trim()}>
            {editingId ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
export default DashboardHome;
