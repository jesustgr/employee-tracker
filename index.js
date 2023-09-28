const mysql = require('mysql2');
const inquirer = require('inquirer');
const { promisify } = require('util');

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