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