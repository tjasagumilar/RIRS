DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS events;

-- Create the events table
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_time DATETIME NOT NULL,
    color VARCHAR(7) NOT NULL, -- Store hex color code, e.g., #FF5733
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create the tasks table
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data into events table
INSERT INTO events (name, description, event_time, color)
VALUES
    ('Meeting with Team', 'Discuss project milestones', '2025-01-20 10:00:00', '#1E90FF'),
    ('Doctor Appointment', 'Annual health checkup', '2025-01-22 15:00:00', '#FF6347'),
    ('Dinner with Family', 'Celebration at home', '2025-01-25 19:30:00', '#FFD700');

-- Insert sample data into tasks table
INSERT INTO tasks (title, due_date, status, priority)
VALUES
    ('Complete Project Proposal', '2025-01-18', 'in_progress', 'high'),
    ('Review Budget Report', '2025-01-20', 'pending', 'medium'),
    ('Prepare Presentation', '2025-01-21', 'pending', 'high');
