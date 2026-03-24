import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormHelperText,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Grid
} from '@mui/material';
import { supabase } from '../../api/supabaseClient';

const AI_MODELS = [
  { value: 'chatgpt-5', label: 'ChatGPT-5' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'custom', label: 'Custom Model' }
];

function ChatbotSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCustomModel, setShowCustomModel] = useState(false);
  const [customModelId, setCustomModelId] = useState('');
  
  const [settings, setSettings] = useState({
    ai_model: 'chatgpt-5',
    system_message: '',
    temperature: 0.7,
    max_tokens: 1000,
    stream_enabled: true
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error } = await supabase
        .from('chatbot_settings')
        .select('*')
        .order('id', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // If no settings exist yet, keep defaults
        if (error.code === 'PGRST116') {
          console.log('No settings found, using defaults');
          return;
        }
        throw error;
      }

      if (data) {
        const modelId = data.ai_model || 'chatgpt-5';
        const isCustomModel = !AI_MODELS.some(m => m.value === modelId && m.value !== 'custom');
        
        setSettings({
          ai_model: isCustomModel ? 'custom' : modelId,
          system_message: data.system_message || '',
          temperature: parseFloat(data.temperature) || 0.7,
          max_tokens: data.max_tokens || 1000,
          stream_enabled: data.stream_enabled !== false
        });
        
        if (isCustomModel) {
          setShowCustomModel(true);
          setCustomModelId(modelId);
        }
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load chatbot settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Prepare settings to save
      const settingsToSave = {
        ...settings,
        ai_model: settings.ai_model === 'custom' ? customModelId : settings.ai_model
      };

      // Validate custom model ID if selected
      if (settings.ai_model === 'custom' && !customModelId.trim()) {
        throw new Error('Please enter a custom model ID');
      }

      // First check if settings exist
      const { data: existing, error: checkError } = await supabase
        .from('chatbot_settings')
        .select('id')
        .limit(1)
        .single();

      let result;
      
      if (checkError && checkError.code === 'PGRST116') {
        // No settings exist, insert new
        result = await supabase
          .from('chatbot_settings')
          .insert([settingsToSave]);
      } else if (existing) {
        // Update existing settings
        result = await supabase
          .from('chatbot_settings')
          .update(settingsToSave)
          .eq('id', existing.id);
      } else {
        throw new Error('Unexpected state while saving settings');
      }

      if (result.error) throw result.error;

      setSuccess('Chatbot settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save chatbot settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    if (field === 'ai_model') {
      setShowCustomModel(value === 'custom');
      if (value !== 'custom') {
        setCustomModelId('');
      }
    }
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        AI Chatbot Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Configure the AI model and system behavior for the customer support chatbot.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* AI Model Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="ai-model-label">AI Model</InputLabel>
                <Select
                  labelId="ai-model-label"
                  value={settings.ai_model}
                  onChange={(e) => handleChange('ai_model', e.target.value)}
                  label="AI Model"
                >
                  {AI_MODELS.map(model => (
                    <MenuItem key={model.value} value={model.value}>
                      {model.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Select the AI model to use for chatbot responses</FormHelperText>
              </FormControl>
            </Grid>

            {/* Custom Model ID Input */}
            {showCustomModel && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Custom Model ID"
                  value={customModelId}
                  onChange={(e) => setCustomModelId(e.target.value)}
                  placeholder="e.g., gpt-4-1106-preview"
                  helperText="Enter the exact model ID for your custom AI model"
                  error={showCustomModel && !customModelId.trim() && saving}
                />
              </Grid>
            )}

            {/* Max Tokens */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Tokens"
                value={settings.max_tokens}
                onChange={(e) => handleChange('max_tokens', parseInt(e.target.value) || 1000)}
                helperText="Maximum number of tokens in the response (100-64000)"
                inputProps={{
                  min: 100,
                  max: 64000,
                  step: 100
                }}
              />
            </Grid>

            {/* Temperature Slider */}
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>
                Temperature: {settings.temperature}
              </Typography>
              <Slider
                value={settings.temperature}
                onChange={(e, value) => handleChange('temperature', value)}
                min={0}
                max={2}
                step={0.1}
                marks={[
                  { value: 0, label: '0' },
                  { value: 0.5, label: '0.5' },
                  { value: 1, label: '1' },
                  { value: 1.5, label: '1.5' },
                  { value: 2, label: '2' }
                ]}
              />
              <FormHelperText>
                Controls randomness: 0 = focused, 2 = creative. Default: 0.7
              </FormHelperText>
            </Grid>

            {/* Stream Enabled */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.stream_enabled}
                    onChange={(e) => handleChange('stream_enabled', e.target.checked)}
                  />
                }
                label="Enable Streaming Responses"
              />
              <FormHelperText>
                Stream responses in real-time for better user experience
              </FormHelperText>
            </Grid>

            {/* System Message */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={12}
                label="System Message"
                value={settings.system_message}
                onChange={(e) => handleChange('system_message', e.target.value)}
                helperText="Define the chatbot's personality and behavior. Leave empty to use default WiMed assistant prompt."
                placeholder={`Example: You are an AI Medical Equipment Assistant for WiMed...

Define the chatbot's role, responsibilities, communication style, and guidelines here.`}
              />
            </Grid>

            {/* Save Button */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  onClick={loadSettings}
                  disabled={saving}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={24} /> : 'Save Settings'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Guide
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>AI Model:</strong> Choose the AI model that powers the chatbot. Different models have different capabilities and costs.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Temperature:</strong> Controls the randomness of responses. Lower values (0-0.5) make the chatbot more focused and deterministic. Higher values (1-2) make it more creative but potentially less accurate.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Max Tokens:</strong> Limits the length of responses. One token is roughly 4 characters. Typical responses use 200-800 tokens.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>System Message:</strong> This is the most important setting. It defines the chatbot's personality, knowledge, and behavior. The system message is included with every conversation to guide the AI's responses.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Custom Models:</strong> Select "Custom Model" to use any OpenAI-compatible model ID. This allows you to use newer models or specific versions not listed in the dropdown.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ChatbotSettings;