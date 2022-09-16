const todo_list = document.querySelector("#todo-list");
const todo_input = document.querySelector("#todo-input");
const todo_complete_all_button = document.querySelector("#complete-all-todos");

todo_input.addEventListener("keyup", todo_enter);
todo_complete_all_button.addEventListener("click", toggle_complete_all_todos);

var todos = [];

function todo_enter(e)
{
    if(e.key === "Enter" || e.keyCode === 13)
    {
        let todo = {
            name: todo_input.value,
            complete: false
        };
        todos.push(todo);

        let todo_node = document.createElement("div");
        //child.innerHTML = todo_input.value;
        let class_styles = ["w-full", "border", "flex", "flex-row", "font-[\'Helvetica\']"];
        class_styles.forEach(style => {
            todo_node.classList.add(style);
        });

        let check_button = document.createElement("button");
        check_button.innerHTML = "<i class=\"fa-regular fa-circle\"></i>";

        check_button.addEventListener('click', (e) => {
            let id = Array.from(todo_list.children).
                     indexOf(e.currentTarget.parentElement) - 2;
            todos[id].complete = !todos[id].complete;
            if(todos[id].complete) e.currentTarget.innerHTML = "<i class=\"fa-solid fa-circle\"></i>";
            else e.currentTarget.innerHTML = "<i class=\"fa-regular fa-circle\"></i>";
            update_todo_node(todos[id].complete, e.currentTarget.nextElementSibling);
        });
        let button_styles = ["basis-1/12", "px-5"];
        button_styles.forEach(style => {
            check_button.classList.add(style);
        });
        
        let todo_content = document.createElement("div");
        let todo_content_styles = ["basis-10/12", "p-3", "text-neutral-600", "text-2xl", "transition" , "ease-in", "duration-300"];
        todo_content_styles.forEach(style => {
            todo_content.classList.add(style);
        });
        todo_content.innerHTML = todo_input.value;

        let delete_button = document.createElement("button");
        delete_button.innerHTML = "x";
        let delete_button_styles = ["basis-1/12", "px-5", "text-rose-300", "text-2xl", "invisible", "transition" , "ease-in", "duration-300", "hover:text-rose-600"];
        delete_button_styles.forEach(style => {
            delete_button.classList.add(style);
        });
        delete_button.addEventListener("click", e => {
            let index = Array.from(todo_list.children).indexOf(e.currentTarget.parentElement);
            todos.splice(index-2, 1);
            todo_list.removeChild(e.currentTarget.parentElement);
        });

        todo_node.appendChild(check_button);
        todo_node.appendChild(todo_content);
        todo_node.appendChild(delete_button);

        todo_node.addEventListener("mouseover", e => {
            e.currentTarget.children[2].classList.replace("invisible", "visible");
        });
        todo_node.addEventListener("mouseout", e => {
            e.currentTarget.children[2].classList.replace("visible", "invisible");
        });
        
        todo_list.appendChild(todo_node);
        todo_input.value = "";
    }
}

function update_todo_node(complete, element)
{
    if(complete)
    {
        element.classList.replace("text-neutral-600", "text-neutral-300");
        element.classList.add("line-through");
    }
    else
    {
        element.classList.replace("text-neutral-300", "text-neutral-600");
        element.classList.remove("line-through");
    }
}

function is_all_todos_completed()
{
    let is_complete = true;
    let incomplete_indicies = [];
    for(var i = 0; i < todos.length; ++i)
    {
        let todo = todos[i];
        if(!todo.complete)
        {
            is_complete = false;
            incomplete_indicies.push(i);
        }
    }

    return {complete: is_complete, indicies: incomplete_indicies};
}

function toggle_complete_all_todos()
{
    let children = todo_list.children;
    let result = is_all_todos_completed();
    if (result.complete)
    {
        let offset = 2;
        for(var i = 2; i < children.length; ++i)
        {
            todos[i-offset].complete = false;
            let check_button = children[i].children[0];
            check_button.innerHTML = "<i class=\"fa-regular fa-circle\"></i>";
            let content = children[i].children[1];
            content.classList.replace("text-neutral-300", "text-neutral-600");
            content.classList.remove("line-through");
        }
    }
    else
    {
        let offset = 2;
        for(const index of result.indicies)
        {
            todos[index].complete = true;
            let check_button = children[index + offset].children[0];
            check_button.innerHTML = "<i class=\"fa-solid fa-circle\"></i>";
            let content = children[index + offset].children[1];
            content.classList.replace("text-neutral-600", "text-neutral-300");
            content.classList.add("line-through");       
        }
    }
}