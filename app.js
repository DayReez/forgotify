const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

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

// Create the server
const server = http.createServer((req, res) => {
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
        // Serve the HTML file
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error loading HTML file... which is probably for the best.');
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
                task.reminderTime = new Date(`1970-01-01T${task.time}:00`).getTime(); // Save the time as a timestamp
                
                // Add task to beginning of array
                tasks.unshift(task);

                // Log the new task
                console.log('New task:', task);

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
                    message: "Failed to add your task. But let's be honest, you weren't going to do it anyway.",
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
                message: "Task deleted! One less thing to procrastinate about!",
                remainingTasks: tasks.length
            }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: "Task not found. Guess it disappeared like your motivation!"
            }));
        }
    }
    // Handle 404
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end("Page not found. Much like your motivation.");
    }
});

// Reminder logic
setInterval(() => {
    const currentTime = new Date().getTime();
    
    tasks.forEach(task => {
        const taskTime = new Date(task.time).getTime();
        
        if (currentTime > taskTime) {
            console.log(`⏰ Reminder: You missed the task "${task.title}"!`);
            console.log("Reason: You probably found something more interesting to do...");
            console.log("Tip: Maybe don't add tasks you won't do next time!");
            
            // Remove the task or log it as missed
            tasks = tasks.filter(t => t.id !== task.id);
        }
    });
}, 60000); // Check every minute

// Error handling
server.on('error', (error) => {
    console.error(`
    🔥 Oops! Server crashed! 🔥
    But hey, at least now you have an excuse not to do your tasks!
    Technical details (if you even care):
    ${error.message}
    `);
});

// Start server with funny message
server.listen(PORT, () => {
    console.log(`
    🌟 ========================== 🌟
    🎉 Procrastination Server is up! 
    🌍 http://localhost:${PORT}/
    📝 Ready to collect your abandoned dreams...
    ⏰ Current time: ${new Date().toLocaleTimeString()}
    🎯 Tasks stored: ${tasks.length}
    💭 "The best time to do nothing is now!"
    🌟 ========================== 🌟
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log(`
    👋 Server shutting down...
    💭 ${tasks.length} tasks will be forgotten, just as you planned.
    `);
    server.close(() => {
        console.log('🌙 Server closed. Time to procrastinate elsewhere!');
        process.exit(0);
    });
});
