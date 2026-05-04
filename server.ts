import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });
  const PORT = 3000;

  app.use(express.json());

  // --- Local Project Configuration ---
  const DEFAULT_BASE_PATH = path.join(os.homedir(), '.config', 'Project');
  
  // Ensure default base path exists
  if (!existsSync(DEFAULT_BASE_PATH)) {
    mkdirSync(DEFAULT_BASE_PATH, { recursive: true });
  }

  // Helper to get formatted timestamp for chat filenames
  const getChatFilename = (title: string) => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    let hoursNum = now.getHours();
    const ampm = hoursNum >= 12 ? 'PM' : 'AM';
    hoursNum = hoursNum % 12;
    hoursNum = hoursNum ? hoursNum : 12; // the hour '0' should be '12'
    const hours = String(hoursNum).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    // Title-DD-MM-YYYY"HH-MM-AM/PM".md
    const safeTitle = title.replace(/[^a-z0-9]/gi, '-').substring(0, 50);
    return `${safeTitle}-${day}-${month}-${year}"${hours}-${minutes}-${ampm}".md`;
  };

  // --- Project API Routes ---

  app.get('/api/projects', async (req, res) => {
    try {
      if (!existsSync(DEFAULT_BASE_PATH)) {
        return res.json([]);
      }
      const files = await fs.readdir(DEFAULT_BASE_PATH);
      const projects = [];
      
      for (const file of files) {
        const projectPath = path.join(DEFAULT_BASE_PATH, file);
        const stats = await fs.stat(projectPath);
        if (stats.isDirectory()) {
          const configPath = path.join(projectPath, 'project.json');
          if (existsSync(configPath)) {
            const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
            projects.push(config);
          }
        }
      }
      res.json(projects);
    } catch (err) {
      console.error('Error listing projects:', err);
      res.status(500).json({ error: 'Failed to list projects' });
    }
  });

  app.post('/api/projects', async (req, res) => {
    const { name, location } = req.body;
    const basePath = location || DEFAULT_BASE_PATH;
    const projectId = Math.random().toString(36).substring(7);
    const projectDir = path.join(basePath, name || projectId);

    try {
      // Create folder structure:
      // Project/
      // - data/
      // - chat/
      // - .Research/
      //   - Link.md
      // - project.json
      
      await fs.mkdir(projectDir, { recursive: true });
      await fs.mkdir(path.join(projectDir, 'data'), { recursive: true });
      await fs.mkdir(path.join(projectDir, 'chat'), { recursive: true });
      await fs.mkdir(path.join(projectDir, '.Research'), { recursive: true });
      
      const linkFilePath = path.join(projectDir, '.Research', 'Link.md');
      await fs.writeFile(linkFilePath, '# Research Links\n\n');

      const projectConfig = {
        id: projectId,
        name: name || 'Untitled Project',
        path: projectDir,
        createdAt: new Date().toISOString(),
        indexedPaths: [],
        settings: {
          modelId: 'gemini-3-flash-preview'
        }
      };

      await fs.writeFile(path.join(projectDir, 'project.json'), JSON.stringify(projectConfig, null, 2));
      
      res.status(201).json(projectConfig);
    } catch (err) {
      console.error('Error creating project:', err);
      res.status(500).json({ error: 'Failed to create project' });
    }
  });

  app.post('/api/projects/:projectId/index', async (req, res) => {
    const { projectId } = req.params;
    const { projectPath, indexedPaths } = req.body;

    if (!projectPath || !existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project path not found' });
    }

    try {
      const configPath = path.join(projectPath, 'project.json');
      if (!existsSync(configPath)) {
        return res.status(404).json({ error: 'Project configuration not found' });
      }

      const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
      config.indexedPaths = indexedPaths;
      
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      res.json(config);
    } catch (err) {
      console.error('Error updating indexed paths:', err);
      res.status(500).json({ error: 'Failed to update indexing' });
    }
  });

  // --- Chat API Routes ---

  app.get('/api/projects/:projectId/chats', async (req, res) => {
    const { projectId } = req.params;
    const projectPath = req.query.path as string;

    if (!projectPath || !existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    try {
      const chatDir = path.join(projectPath, 'chat');
      if (!existsSync(chatDir)) {
        return res.json([]);
      }

      const files = await fs.readdir(chatDir);
      const chats = files
        .filter(f => f.endsWith('.md'))
        .map(f => ({
          id: f,
          title: f.split('-').slice(0, -5).join('-') || 'Untitled',
          updatedAt: new Date().toISOString(), // In real app, get from file stats
        }));
      
      res.json(chats);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list chats' });
    }
  });

  app.post('/api/projects/:projectId/chats', async (req, res) => {
    const { projectId } = req.params;
    const { projectPath, title, messages } = req.body;

    if (!projectPath || !existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project path not found' });
    }

    try {
      const filename = getChatFilename(title || 'New Conversation');
      const chatPath = path.join(projectPath, 'chat', filename);
      
      const content = `# ${title || 'New Conversation'}\nCreated: ${new Date().toLocaleString()}\n\n` + 
        messages.map((m: any) => `${m.role}:\n${m.content}\n\n`).join('');

      await fs.writeFile(chatPath, content);
      res.status(201).json({ id: filename, title: title || 'New Conversation' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create chat' });
    }
  });

  app.patch('/api/projects/:projectId/chats/:chatId', async (req, res) => {
    const { projectId, chatId } = req.params;
    const { projectPath, title, pinned } = req.body;

    if (!projectPath || !existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    try {
      const chatDir = path.join(projectPath, 'chat');
      const oldPath = path.join(chatDir, chatId);
      
      // If title changed, rename the file
      let newChatId = chatId;
      if (title) {
        const newFilename = getChatFilename(title);
        const newPath = path.join(chatDir, newFilename);
        await fs.rename(oldPath, newPath);
        newChatId = newFilename;
      }

      // Metadata like "pinned" could be stored in the filename or a sidecar file, 
      // but for now we'll just handle the rename.
      res.json({ id: newChatId, title: title || chatId, pinned });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update chat' });
    }
  });

  app.delete('/api/projects/:projectId/chats/:chatId', async (req, res) => {
    const { projectId, chatId } = req.params;
    const projectPath = req.query.path as string;

    if (!projectPath || !existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    try {
      const chatPath = path.join(projectPath, 'chat', chatId);
      await fs.unlink(chatPath);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete chat' });
    }
  });

  // --- Research API Routes ---

  app.post('/api/projects/:projectId/research', async (req, res) => {
    const { projectId } = req.params;
    const { projectPath, url } = req.body;

    if (!projectPath || !existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    try {
      const linkFilePath = path.join(projectPath, '.Research', 'Link.md');
      const timestamp = new Date().toLocaleString();
      const linkEntry = `- [${url}](${url}) - Added: ${timestamp}\n`;
      
      await fs.appendFile(linkFilePath, linkEntry);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to log research link' });
    }
  });

  app.get('/api/projects/:projectId/files', async (req, res) => {
    const { projectId } = req.params;
    const projectPath = req.query.path as string;

    if (!projectPath || !existsSync(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    try {
      const walk = async (dir: string): Promise<any[]> => {
        const files = await fs.readdir(dir);
        const list = [];
        for (const file of files) {
          if (file === 'node_modules' || file === '.git') continue;
          const fullPath = path.join(dir, file);
          const stats = await fs.stat(fullPath);
          list.push({
            name: file,
            path: fullPath,
            size: stats.size,
            isDirectory: stats.isDirectory(),
            updatedAt: stats.mtime.toISOString(),
            children: stats.isDirectory() ? await walk(fullPath) : undefined
          });
        }
        return list;
      };

      const fileTree = await walk(projectPath);
      res.json(fileTree);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list files' });
    }
  });

  // --- Models and Usage (Existing) ---

  app.get('/api/models', (req, res) => {
    res.json([
      { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', provider: 'google', status: 'online', context: '128k' },
      { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', provider: 'google', status: 'online', context: '1M' },
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', status: 'offline', context: '128k' },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic', status: 'offline', context: '200k' },
      { id: 'llama-3-70b', name: 'Llama 3 70B', provider: 'ollama', status: 'offline', context: '8k' },
    ]);
  });

  app.get('/api/usage', (req, res) => {
    res.json({
      tokens: 125430,
      cost: 1.42,
      requests: 42
    });
  });

  // --- End API Routes ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Aether AI Studio running at http://localhost:${PORT}`);
  });
}

startServer();
