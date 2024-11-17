const fs = require('fs');
const path = require('path');

// Array of sarcastic responses when tasks are added
const serverResponses = [
    "Task successfully added to your pile of procrastination!",
    "Great, another task you'll probably never complete!",
    "Added to your ever-growing list of broken promises!",
    "Task saved! Future you will be so *thrilled* about this.",
    "Success! (But let's be real, will you actually do it?)",
    "Task logged. Your productivity level remains... questionable.",
    "Added to your collection of future regrets!",
    "Reminder set! Don't worry, we'll remind you when you're busy procrastinating.",
    "Task saved successfully... unlike your motivation!",
    "Achievement unlocked: Master of Planning (Execution pending)"
];

// In-memory storage for tasks
let tasks = [];

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Route handling
    if (req.method === 'GET' && req.url === '/') {
        // Serve the index.html file from the public directory
        const indexPath = path.join(__dirname, '..', 'public', 'index.html');
        fs.readFile(indexPath, (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error loading HTML file...');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } 
    // Get all tasks
    else if (req.method === 'GET' && req.url === '/tasks') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            tasks: tasks,
            message: "Here's your list of future disappointments!"
        }));
    } 
    // Add new task
    else if (req.method === 'POST' && req.url === '/add-reminder') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const task = JSON.parse(body);
                
                // Add timestamp and ID to task
                task.id = Date.now().toString();
                task.createdAt = new Date().toISOString();
                
                // Add task to beginning of array
                tasks.unshift(task);

                // Send success response with random sassy message
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    message: serverResponses[Math.floor(Math.random() * serverResponses.length)],
                    task: task,
                    totalTasks: tasks.length
                }));
            } catch (error) {
                console.error('Error processing task:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    message: "Failed to add your task.",
                    error: error.message
                }));
            }
        });
    }
    // Delete task
    else if (req.method === 'DELETE' && req.url.startsWith('/task/')) {
        const taskId = req.url.split('/')[2];
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            tasks.splice(taskIndex, 1);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: "Task deleted!",
                remainingTasks: tasks.length
            }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: "Task not found."
            }));
        }
    }
    // Handle 404
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end("Page not found.");
    }
};
