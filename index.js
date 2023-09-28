const mysql = require('mysql2');
const inquirer = require('inquirer');
const { promisify } = require('util');

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'employees_db',
});

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
    }
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