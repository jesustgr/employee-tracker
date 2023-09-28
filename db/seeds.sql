USE employees_db;

INSERT INTO department (name)
VALUES 
    ('Front Desk'), -- 1
    ('Housekeeping'); -- 2


INSERT INTO role (title, salary, department_id)
VALUES
    ('Front Desk Agent', 50000, 1), -- 1
    ('Reservation Specialist', 70000, 1), -- 2
    ('Front Office Manager', 100000, 1), -- 3
    ('Maintenance Technician', 70000, 2), -- 4
    ('Housekeeper', 50000, 2), -- 5
    ('Housekeeping Manager', 100000, 2); -- 6


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ('Dennis', 'Garcia', 3, NULL),
    ('Celina', 'Rodriguez', 6, NULL),
    ('Jesus', 'Reyes', 1, 1),
    ('Simone', 'Hicks', 1, 1),
    ('Marisa', 'Androvich', 1, 1),
    ('Rita', 'Choi', 2, 1),
    ('Emiterio', 'Torres', 4, 2),
    ('Monica', 'Gonzalez', 5 , 2),
    ('Mari', 'Hernandez', 5, 2),
    ('Maria', 'Sanchez', 5, 2);