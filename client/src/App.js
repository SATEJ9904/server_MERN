import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Typography,
    TextField,
    Button,
    Grid,
    Paper,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';

const App = () => {
    const [students, setStudents] = useState([]);
    const [form, setForm] = useState({ name: '', email: '', course: '', Previous_Degree: '' });
    const [selectedId, setSelectedId] = useState(null);

    const fetchStudents = async () => {
        const res = await axios.get('/api/students');
        setStudents(res.data);
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleSubmit = async () => {
        if (selectedId) {
            await axios.put(`/api/students/${selectedId}`, form);
        } else {
            await axios.post('/api/students', form);
        }
        setForm({ name: '', email: '', course: '', Previous_Degree: '' });
        setSelectedId(null);
        fetchStudents();
    };

    const handleEdit = (student) => {
        setForm(student);
        setSelectedId(student._id);
    };

    const handleDelete = async (id) => {
        await axios.delete(`/api/students/${id}`);
        fetchStudents();
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom align="center">Student Form</Typography>
            <Paper sx={{ p: 3, mb: 4 }} elevation={4}>
                <Grid container spacing={2}>
                    {['name', 'email', 'course', 'Previous_Degree'].map((field) => (
                        <Grid item xs={12} sm={6} key={field}>
                            <TextField
                                fullWidth
                                label={field.toUpperCase()}
                                value={form[field]}
                                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                            />
                        </Grid>
                    ))}
                    <Grid item xs={12}>
                        <Button fullWidth variant="contained" color="primary" onClick={handleSubmit}>
                            {selectedId ? 'Update Student' : 'Add Student'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6">All Students</Typography>
                <List>
                    {students.map((s) => (
                        <ListItem key={s._id} divider>
                            <ListItemText
                                primary={`${s.name} (${s.course})`}
                                secondary={`${s.email} | Enrolled: ${s.Previous_Degree}`}
                            />
                            <Button size="small" onClick={() => handleEdit(s)}>Edit</Button>
                            <Button size="small" color="error" onClick={() => handleDelete(s._id)}>Delete</Button>
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Container>
    );
};

export default App;