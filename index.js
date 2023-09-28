const mysql = require('mysql2');
const inquirer = require('inquirer');
const { promisify } = require('util');

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'employees_db',
});

const queryAsync = promisify(db.query).bind(db);

init();

async function init() {
    while (true) {
        let data = await promptUser();
        if (data.action === "view all departments") {
            try {
                const response = await queryAsync('SELECT * FROM department');
                console.table(response);
            } catch (error) {
                console.log(error);
            }
        }
        else if (data.action === "view all roles") {
            try {
                const response = await queryAsync('SELECT role.*, department.name AS department_name FROM role LEFT JOIN department ON role.department_id = department.id');
                console.table(response);
            } catch (error) {
                console.log(error);
            }
        }
        else if (data.action === "view all employees") {
            try {
                const response = await queryAsync(`
                    SELECT 
                        emp.id AS employee_id,
                        emp.first_name,
                        emp.last_name,
                        role.title AS job_title,
                        department.name AS department,
                        role.salary,
                        CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name
                    FROM 
                        employee emp
                    LEFT JOIN 
                        role ON emp.role_id = role.id
                    LEFT JOIN 
                        department ON role.department_id = department.id
                    LEFT JOIN 
                        employee manager ON emp.manager_id = manager.id;
                `);
                console.log('success!');
                console.table(response);
            } catch (error) {
                console.log(error);
            }
        }
        else if (data.action === "add a department") {
            let answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: "departmentName",
                    message: "What would you like to name the department?"
                }
            ]);
            let department = answers.departmentName;
            try {
                const response = await queryAsync('INSERT INTO department(name) VALUES (?)', department);
                console.log(`success! added ${department} to the database`);
            } catch (error) {
                console.log(error);
            }
        }
        else if (data.action === "add a role") {
            let allDepartments = await queryAsync('SELECT name FROM department');
            allDepartments = allDepartments.map(el => el.name);

            let answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: "roleName",
                    message: "What would you like to name the role?"
                },
                {
                    type: 'input',
                    name: "salary",
                    message: "What is the salary for this role?"
                },
                {
                    type: 'list',
                    name: "department",
                    message: "Which department?",
                    choices: allDepartments
                }
            ]);

            let { roleName, salary, department } = answers;
            let departmentResult = await queryAsync(`SELECT role.department_id FROM role
                                                        JOIN department ON role.department_id = department.id 
                                                        WHERE department.name = ?`, department);
            
            let department_id = departmentResult.length > 0 ? departmentResult[0].department_id : null;
            let response =  await queryAsync(`INSERT INTO role(title, salary, department_id)
                                                VALUES (?, ?, ?)`, [roleName, salary, department_id]);
            try {
                const response = await queryAsync
                console.log('success!');
            } catch (error) {
                console.log(error);
            }
        }
        else if (data.action === "add an employee") {
            try {
                let roleData = await queryAsync('SELECT id, title FROM role');
                let roleChoices = roleData.map(role => role.title);
        
                let managerData = await queryAsync('SELECT id, CONCAT(first_name, " ", last_name) AS manager_name FROM employee');
                let managerChoices = managerData.map(manager => manager.manager_name);
        
                let answers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'firstName',
                        message: "What is the first name of the employee?"
                    },
                    {
                        type: 'input',
                        name: "lastName",
                        message: "What is the last name of the employee?"
                    },
                    {
                        type: 'list',
                        name: 'role',
                        message: 'What is the role of the employee?',
                        choices: roleChoices
                    },
                    {
                        type: 'list',
                        name: 'manager',
                        message: 'Who is the employee\'s manager?',
                        choices: managerChoices.concat('None')
                    }
                ]);
        
                const selectedRole = roleData.find(role => role.title === answers.role);
                const roleId = selectedRole.id;
        
                const selectedManager = managerData.find(manager => manager.manager_name === answers.manager);
                const managerId = selectedManager ? selectedManager.id : null;
        
                const { firstName, lastName } = answers;
                await queryAsync('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [firstName, lastName, roleId, managerId]);
                console.log('Employee added successfully!');
            } catch (error) {
                console.log(error);
            }
        }
        else if (data.action === "update an employee role") {
            try{
                let employees = await queryAsync('SELECT first_name, last_name FROM employee');
                employees = employees.map(emp => emp.first_name + " " + emp.last_name);

                let roles = await queryAsync('SELECT title FROM role');
                roles = roles.map(role => role.title);

                let answer = await inquirer.prompt([
                    {
                        type: 'list',
                        message: "Which employee do you want to update?",
                        name: 'employeeToUpdate',
                        choices: employees
                    },
                    {
                        type: 'list',
                        message: 'What role do you want to assign?',
                        name: 'role',
                        choices: roles
                    }
                ]);
                let fullName = answer.employeeToUpdate.split(' ');

                let roleIdResult = await queryAsync('SELECT id FROM role WHERE title = ?', answer.role);
                let roleId = roleIdResult[0].id;
                let response = await queryAsync('UPDATE employee SET role_id = ? WHERE (first_name = ? AND last_name = ?)',[roleId, fullName[0], fullName[1]]);
            } catch (error){
                console.log(error);
            }
        }
        else {
            break;
        }
    }
    console.log('Goodbye!');
}


async function promptUser(){
    let answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: "Please choose an action.",
            choices: ["view all departments", "view all roles", 
            "view all employees", "add a department", "add a role", "add an employee", "update an employee role","quit"]
        }
    ]);
    return answers;
}