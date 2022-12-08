const todo_control = document.querySelector("#todo-control");
const todo_list = document.querySelector("#todo-list");
const todo_input = document.querySelector("#todo-input");
const todo_info = document.querySelector("#todo-info");
const todo_menu = document.querySelector("#todo-menu");
const todo_item_count = document.querySelector("#todo-item-count");
const todo_complete_all_button = document.querySelector("#complete-all-todos");
const todo_menu_all_button = document.querySelector("#todo-menu-all");
const todo_menu_active_button = document.querySelector("#todo-menu-active");
const todo_menu_completed_button = document.querySelector("#todo-menu-completed");
const todo_clear_button = document.querySelector("#todo-clear-completed");

todo_input.addEventListener("keyup", todo_enter);
todo_complete_all_button.addEventListener("click", toggle_complete_all_todos);

var todos = [];

const Todo_Menu_Buttons = 
{
    All: 0,
    Active: 1,
    Completed: 2
}

var selected_button = Todo_Menu_Buttons.All;
function switch_button(current_index)
{
    if(selected_button != current_index)
    {
        todo_menu.children[selected_button].classList.remove("border", "border-rose-300/25", "rounded", "px-2", "py-1");
        selected_button = current_index;
        todo_menu.children[selected_button].classList.add("border", "border-rose-300/25", "rounded", "px-2", "py-1");
    }
}
todo_menu_all_button.addEventListener("click", e => 
{
    let index = Todo_Menu_Buttons.All;

    switch_button(index);
    todo_list.innerHTML = "";

    todos.forEach((todo, index) => {
        append_todo_node(todo, index);
    });
});
todo_menu_active_button.addEventListener("click", e => 
{
    let index = Todo_Menu_Buttons.Active;

    switch_button(index);
    todo_list.innerHTML = "";

    todos.forEach((todo, index) => {
        if(!todo.complete)
        {
            append_todo_node(todo, index);
        }
    });
});
todo_menu_completed_button.addEventListener("click", e => 
{
    let index = Todo_Menu_Buttons.Completed;

    switch_button(index);
    todo_list.innerHTML = "";

    todos.forEach((todo, index) => {
        if(todo.complete)
        {
            append_todo_node(todo, index);
        }
    });
});
todo_clear_button.addEventListener("click", e => {
    var i = 0;
    while(has_completed(todos))
    {
        if(todos[i].complete)
        {
            todos.splice(i, 1);
            i = 0;
        }
        else
            ++i;
    }
    localStorage.setItem("todos", JSON.stringify(todos));
    switch(selected_button)
    {
        case Todo_Menu_Buttons.Completed:
            todo_list.innerHTML = "";
            break;
        case Todo_Menu_Buttons.All:
            todo_list.innerHTML = "";
            todos.forEach((todo, index) => {
                append_todo_node(todo, index);
            });
            break;
    }

    e.currentTarget.classList.replace("visible", "invisible");
    todo_item_count.innerHTML = todos.length + " item left";
    if(todos.length === 0)
    {
        todo_control.classList.add("shadow-xl");
        todo_info.classList.replace("visible", "invisible");
    }
});

function show_clear_button()
{
    if(has_completed(todos))
    {
        todo_clear_button.classList.replace("invisible", "visible");
    }
    else
    {
        todo_clear_button.classList.replace("visible", "invisible");
    }
}

function append_todo_node(todo, todo_index)
{
    let todo_node = document.createElement("div");
    todo_node.setAttribute("data-index", todo_index);
    //child.innerHTML = todo_input.value;
    todo_node.classList.add("w-full", "border", "flex", "flex-row", "font-[\'Helvetica\']");

    let check_button = document.createElement("button");
    if(todo.complete) 
        check_button.innerHTML = "<i class=\"fa-solid fa-circle\"></i>";
    else 
        check_button.innerHTML = "<i class=\"fa-regular fa-circle\"></i>";
    
    check_button.addEventListener('click', (e) => {
        let id = e.currentTarget.parentElement.dataset.index;

        todos[id].complete = !todos[id].complete;
        localStorage.setItem("todos", JSON.stringify(todos));

        switch(selected_button)
        {
            case Todo_Menu_Buttons.Active:
                todo_list.removeChild(e.currentTarget.parentElement);
                break;
            case Todo_Menu_Buttons.Completed:
                todo_list.removeChild(e.currentTarget.parentElement);
                break;
            default:
                if(todos[id].complete) e.currentTarget.innerHTML = "<i class=\"fa-solid fa-circle\"></i>";
                else e.currentTarget.innerHTML = "<i class=\"fa-regular fa-circle\"></i>";
                update_todo_node(todos[id].complete, e.currentTarget.nextElementSibling);
        }

        show_clear_button();
    });
    check_button.classList.add("basis-1/12", "px-5");
    
    let todo_content = document.createElement("div");
    todo_content.classList.add("basis-10/12", "p-3", "text-neutral-600", "text-2xl", "transition" , "ease-in", "duration-300");
    todo_content.innerHTML = todo.body;
    update_todo_node(todo.complete, todo_content);

    let delete_button = document.createElement("button");
    delete_button.innerHTML = "x";
    delete_button.classList.add("basis-1/12", "px-5", "text-rose-300", "text-2xl", "invisible", "transition" , "ease-in", "duration-300", "hover:text-rose-600");
    delete_button.addEventListener("click", e => {
        let id = e.currentTarget.parentElement.dataset.index;
        todos.splice(id, 1);
        localStorage.setItem("todos", JSON.stringify(todos));
        todo_item_count.innerHTML = todos.length + " item left";
        if(todos.length <= 0)
        {
            todo_control.classList.add("shadow-xl");
            todo_info.classList.replace("visible", "invisible");
            show_clear_button();
        } 
        todo_list.removeChild(e.currentTarget.parentElement);
    });

    update_todo_node(todo.complete, todo_content);

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
}

function todo_enter(e)
{
    if((e.key === "Enter" || e.keyCode === 13) && todo_input.value != "")
    {
        if(todos.length === 0)
        {
            todo_menu.children[selected_button].classList.remove("border", "border-rose-300/25", "rounded", "px-2", "py-1");
            selected_button = Todo_Menu_Buttons.All;
            todo_menu_all_button.classList.add("border", "border-rose-300/25", "rounded", "px-2", "py-1");
        }

        let todo = {
            body: todo_input.value,
            complete: false
        };
        todos.push(todo);
        localStorage.setItem("todos", JSON.stringify(todos));
        
        todo_control.classList.remove("shadow-xl");
        todo_info.classList.replace("invisible", "visible");
        todo_item_count.innerHTML = todos.length + " item left";

        append_todo_node(todo, todos.length-1);
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

function has_completed(array)
{
    return array.some((todo) => {
        return todo.complete;
    });
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
    let length = children.length;
    let result = is_all_todos_completed();
    
    if (result.complete)
    {
        for(var i = 0; i < length; ++i)
        {
            todos[i].complete = false;
            switch(selected_button)
            {
                case Todo_Menu_Buttons.Active:
                    todo_list.removeChild(children[0]);
                    break;
                case Todo_Menu_Buttons.Completed:
                    todo_list.removeChild(children[0]);
                    break;
                default:
                    let check_button = children[i].children[0];
                    check_button.innerHTML = "<i class=\"fa-regular fa-circle\"></i>";
                    let content = children[i].children[1];
                    content.classList.replace("text-neutral-300", "text-neutral-600");
                    content.classList.remove("line-through");
            }
        }
    }
    else
    {
        for(const index of result.indicies)
        {
            todos[index].complete = true;
            switch(selected_button)
            {
                case Todo_Menu_Buttons.Active:
                    todo_list.removeChild(children[0]);
                    break;
                case Todo_Menu_Buttons.All:
                    let check_button = children[index].children[0];
                    check_button.innerHTML = "<i class=\"fa-solid fa-circle\"></i>";
                    let content = children[index].children[1];
                    content.classList.replace("text-neutral-600", "text-neutral-300");
                    content.classList.add("line-through");      
            }
        }

        if(selected_button === Todo_Menu_Buttons.Completed)
        {
            todo_list.innerHTML = "";

            todos.forEach((todo, index) => {
                if(todo.complete)
                {
                    append_todo_node(todo, index);
                }
            });
        }
    }

    show_clear_button();
}

const loadTodos = () => {
    todos = JSON.parse(localStorage.getItem("todos"));
    if(todos === null)
    {
        todos = [];
    }
    else
    {
        if(todos.length > 0)
        {
            show_clear_button();
            todo_item_count.innerHTML = todos.length + " item left";
            todo_info.classList.replace("invisible", "visible");
            todo_control.classList.remove("shadow-xl");
            todo_menu_all_button.classList.add("border", "border-rose-300/25", "rounded", "px-2", "py-1");
            todos.forEach((todo, index) => {
                append_todo_node(todo, index);
            });
        }
    }
};

window.addEventListener('load', loadTodos);