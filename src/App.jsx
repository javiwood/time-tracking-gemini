import React from 'react';
import { Clock, Briefcase, Plus, Trash2, BarChart2, ChevronDown, ChevronUp, X, Menu } from 'lucide-react';

// ------ MOCK DATA ------
// In a real application, this data would come from your Azure SQL backend.
const initialProjects = [
    { id: 1, name: 'Project Alpha - Mobile App' },
    { id: 2, name: 'Project Bravo - Website Redesign' },
    { id: 3, name: 'Internal - R&D' },
    { id: 4, name: 'Client X - Marketing Campaign' },
];

const initialTimeEntries = [
    { id: 101, projectId: 2, taskDescription: 'Initial design mockups', hours: 4.5, date: '2025-06-20' },
    { id: 102, projectId: 1, taskDescription: 'Setup development environment', hours: 3.0, date: '2025-06-19' },
    { id: 103, projectId: 3, taskDescription: 'Research new charting libraries', hours: 2.0, date: '2025-06-19' },
    { id: 104, projectId: 2, taskDescription: 'Wireframing user flows', hours: 5.0, date: '2025-06-18' },
    { id: 105, projectId: 4, taskDescription: 'Analyze competitor ads', hours: 2.5, date: '2025-06-20' },
];


// ------ HELPER FUNCTIONS ------
/**
 * A simple, modern hashing function for generating unique IDs.
 * @param {string} str The string to hash.
 * @returns {number} A hash code.
 */
const cyrb53 = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};


// ------ MAIN APP COMPONENT ------
function App() {
    // ---- STATE MANAGEMENT ----
    const [page, setPage] = React.useState('dashboard'); // 'dashboard', 'log', 'manage'
    const [projects, setProjects] = React.useState(initialProjects);
    const [timeEntries, setTimeEntries] = React.useState(initialTimeEntries);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    // ---- DERIVED STATE (SUMMARY) ----
    const summaryData = React.useMemo(() => {
        const summary = projects.map(p => ({ ...p, totalHours: 0 }));
        timeEntries.forEach(entry => {
            const project = summary.find(p => p.id === entry.projectId);
            if (project) {
                project.totalHours += entry.hours;
            }
        });
        return summary.sort((a, b) => b.totalHours - a.totalHours);
    }, [timeEntries, projects]);
    
    // ---- CRUD OPERATIONS ----
    // In a real app, these would be Axios calls to your backend API.

    const addProject = (projectName) => {
        if (projectName && !projects.some(p => p.name === projectName)) {
            const newProject = {
                id: cyrb53(projectName + Date.now()), // Generate a unique ID
                name: projectName
            };
            setProjects([...projects, newProject]);
        }
    };

    const deleteProject = (projectId) => {
        // Also delete associated time entries
        setTimeEntries(timeEntries.filter(entry => entry.projectId !== projectId));
        setProjects(projects.filter(p => p.id !== projectId));
    };

    const addTimeEntry = (entry) => {
        const newEntry = {
            ...entry,
            id: cyrb53(entry.taskDescription + entry.date + Math.random()), // Generate unique ID
        };
        setTimeEntries([newEntry, ...timeEntries]);
        setPage('dashboard'); // Navigate to dashboard after logging time
    };

    const deleteTimeEntry = (entryId) => {
        setTimeEntries(timeEntries.filter(entry => entry.id !== entryId));
    };

    // ---- RENDER LOGIC ----
    const renderPage = () => {
        switch (page) {
            case 'log':
                return <TimeLogForm projects={projects} onSubmit={addTimeEntry} />;
            case 'manage':
                return <ProjectManager projects={projects} onAddProject={addProject} onDeleteProject={deleteProject} />;
            case 'dashboard':
            default:
                return <Dashboard summary={summaryData} recentEntries={timeEntries.slice(0, 5)} onDeleteEntry={deleteTimeEntry} projects={projects}/>;
        }
    };

    const NavLink = ({ activePage, targetPage, children, setPage, closeMenu }) => {
        const isActive = activePage === targetPage;
        return (
            <button
                onClick={() => { setPage(targetPage); closeMenu(); }}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
            >
                {children}
            </button>
        );
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar Navigation */}
            <aside className={`absolute md:relative z-20 md:z-auto w-64 bg-white shadow-md transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <div className="p-4 border-b">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Clock className="mr-2 text-blue-600" /> TimeTracker
                    </h1>
                </div>
                <nav className="p-4 space-y-2">
                    <NavLink activePage={page} targetPage="dashboard" setPage={setPage} closeMenu={() => setIsMobileMenuOpen(false)}>
                        <BarChart2 className="mr-3 h-5 w-5" /> Dashboard
                    </NavLink>
                    <NavLink activePage={page} targetPage="log" setPage={setPage} closeMenu={() => setIsMobileMenuOpen(false)}>
                        <Plus className="mr-3 h-5 w-5" /> Log Time
                    </NavLink>
                    <NavLink activePage={page} targetPage="manage" setPage={setPage} closeMenu={() => setIsMobileMenuOpen(false)}>
                        <Briefcase className="mr-3 h-5 w-5" /> Manage Projects
                    </NavLink>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-4 bg-white border-b">
                     <button className="md:hidden text-gray-500" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <Menu size={24} />
                    </button>
                    <h2 className="text-xl font-semibold text-gray-700 capitalize">{page}</h2>
                    <div>
                        {/* User profile section could go here */}
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6 lg:p-8">
                    {renderPage()}
                </main>
            </div>
             {isMobileMenuOpen && <div className="fixed inset-0 bg-black opacity-50 z-10 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}
        </div>
    );
}


// ------ CHILD COMPONENTS ------

// ---- Dashboard Page ----
function Dashboard({ summary, recentEntries, onDeleteEntry, projects }) {
    const getProjectName = (id) => projects.find(p => p.id === id)?.name || 'Unknown Project';

    return (
        <div className="space-y-6">
            {/* Project Summary */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <BarChart2 className="mr-2 text-blue-500"/> Project Summary
                </h3>
                <div className="space-y-4">
                    {summary.length > 0 ? summary.map((proj, index) => (
                        <div key={proj.id}>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium">{proj.name}</span>
                                <span className="font-bold text-gray-800">{proj.totalHours.toFixed(1)} hrs</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                <div 
                                    className="bg-blue-500 h-2.5 rounded-full" 
                                    style={{ width: `${(proj.totalHours / Math.max(1, ...summary.map(p => p.totalHours))) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )) : <p className="text-gray-500 italic">No time logged yet. Go to "Log Time" to add your first entry.</p>}
                </div>
            </div>

            {/* Recent Time Entries */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                     <Clock className="mr-2 text-green-500"/> Recent Entries
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b-2 border-gray-200">
                            <tr>
                                <th className="py-2 px-4 font-semibold text-gray-600">Project</th>
                                <th className="py-2 px-4 font-semibold text-gray-600">Task</th>
                                <th className="py-2 px-4 font-semibold text-gray-600 text-center">Hours</th>
                                <th className="py-2 px-4 font-semibold text-gray-600 text-center">Date</th>
                                <th className="py-2 px-4 font-semibold text-gray-600 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentEntries.length > 0 ? recentEntries.map(entry => (
                                <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-700">{getProjectName(entry.projectId)}</td>
                                    <td className="py-3 px-4 text-gray-600">{entry.taskDescription}</td>
                                    <td className="py-3 px-4 text-center text-gray-700 font-medium">{entry.hours.toFixed(1)}</td>
                                    <td className="py-3 px-4 text-center text-gray-600">{new Date(entry.date + 'T00:00:00').toLocaleDateString()}</td>
                                    <td className="py-3 px-4 text-center">
                                        <button onClick={() => onDeleteEntry(entry.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500 italic">No recent entries.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ---- Time Log Form ----
function TimeLogForm({ projects, onSubmit }) {
    const [projectId, setProjectId] = React.useState(projects.length > 0 ? projects[0].id : '');
    const [taskDescription, setTaskDescription] = React.useState('');
    const [hours, setHours] = React.useState('');
    const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = React.useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Input Validation
        if (!projectId || !taskDescription || !hours || !date) {
            setError('All fields are required.');
            return;
        }
        if (parseFloat(hours) <= 0 || parseFloat(hours) > 24) {
            setError('Hours must be a positive number, up to 24.');
            return;
        }
        setError('');

        onSubmit({
            projectId: parseInt(projectId),
            taskDescription,
            hours: parseFloat(hours),
            date,
        });

        // Reset form
        setTaskDescription('');
        setHours('');
    };

    return (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Log New Time Entry</h3>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                    <select
                        id="project"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                    >
                        {projects.length > 0 ? projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        )) : <option disabled>Please add a project first</option>}
                    </select>
                </div>
                <div>
                    <label htmlFor="task" className="block text-sm font-medium text-gray-700 mb-1">Task Description</label>
                    <input
                        type="text"
                        id="task"
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        placeholder="e.g., Developed the login feature"
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">Hours Worked</label>
                        <input
                            type="number"
                            id="hours"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            step="0.1"
                            min="0.1"
                            max="24"
                            placeholder="e.g., 2.5"
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                            required
                        />
                    </div>
                </div>
                <div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105">
                        Log Time
                    </button>
                </div>
            </form>
        </div>
    );
}

// ---- Project Manager Page ----
function ProjectManager({ projects, onAddProject, onDeleteProject }) {
    const [newProjectName, setNewProjectName] = React.useState('');
    const [error, setError] = React.useState('');
    
    const handleAdd = () => {
        if (!newProjectName.trim()) {
            setError('Project name cannot be empty.');
            return;
        }
        if (projects.some(p => p.name.toLowerCase() === newProjectName.trim().toLowerCase())) {
            setError('A project with this name already exists.');
            return;
        }
        setError('');
        onAddProject(newProjectName.trim());
        setNewProjectName('');
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Project</h3>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">{error}</div>}
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="Enter new project name"
                        className="flex-grow p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                    <button onClick={handleAdd} className="bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 transition-transform transform hover:scale-105 flex items-center justify-center">
                        <Plus size={20} className="mr-2"/> Add Project
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Existing Projects</h3>
                <ul className="space-y-3">
                    {projects.length > 0 ? projects.map(p => (
                        <li key={p.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                            <span className="text-gray-700">{p.name}</span>
                            <button onClick={() => onDeleteProject(p.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </li>
                    )) : <p className="text-gray-500 italic">No projects found. Add one above to get started.</p>}
                </ul>
            </div>
        </div>
    );
}

export default App;
