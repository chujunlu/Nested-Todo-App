//version: 1.0.0
var util = {
    uuid: function () {
        var i, random;
        var uuid = '';

        for (i = 0; i < 32; i++) {
            random = Math.random() * 16 | 0;
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                uuid += '-';
            }
            uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
        }

        return uuid;
    },
    store: function (namespace, data) {
        if (arguments.length > 1) {
            return localStorage.setItem(namespace, JSON.stringify(data));
        } else {
            var store = localStorage.getItem(namespace);
            return (store && JSON.parse(store)) || [];
        }
    }
};

var app = {
    init: function () {
        this.todos = util.store('todos-javaScript');
        if (this.todos.length === 0) {
            this.todos.push({
                id: util.uuid(),
                title: '',
                level: 0,
                completed: false
            });
            this.storeCurrentTodos();
        }

        view.render(this.todos);
        document.getElementsByClassName('edit')[0].focus();
        this.setUpEvents();
    },
    setUpEvents: function () {
        var ulParent = document.getElementById('container');
        ulParent.addEventListener('keyup', function (event) {
            if (event.target.className === "edit" || event.target.className === "edit completed") {
                app.update(event);
                if (event.which === 13) {
                    app.addTodoByEnter(event);
                }
            }
        });
        ulParent.addEventListener('mouseover', function (event) {
            if (event.target.className === "addSub" || event.target.className === "toggleCompleted"
                || event.target.className === "deletion" || event.target.className === "showHide") {
                document.activeElement.blur();
            }
        });
        ulParent.addEventListener('mouseover', function (event) {
            if (event.target.className === "showHide" || event.target.className === "dropdown" 
                || event.target.className === "edit") {
                app.displaySigns(event);
            }
        });
        ulParent.addEventListener('click', function (event) {
            if (event.target.className === "showHide") {
                app.showHide(event);
            }
        });
        ulParent.addEventListener('click', function (event) {
            if (event.target.className === "addSub") {
                app.addSubByDropdown(event);
            }
        });
        ulParent.addEventListener('click', function (event) {
            if (event.target.className === "toggleCompleted") {
                app.toggleCompleted(event);
            }
        });
        ulParent.addEventListener('click', function (event) {
            if (event.target.className === "deletion") {
                app.deleteByDropdown(event);
            }
        });
        ulParent.addEventListener('mouseout', function (event) {
            if (event.target.className === "showHide") {
                app.hideSigns(event);
            }
        });
        ulParent.addEventListener('mouseout', function (event) {
            if (event.target.className === "edit") {
                app.hideSigns(event);
            }
        });
    },
    storeCurrentTodos: function () {
        util.store('todos-javaScript', this.todos);
    },
    locateElement: function (array, target) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].id === target) {
                return {
                    todo: array[i],
                    index: i,
                    list: array
                };
            } else {
                if (array[i].hasOwnProperty('subTodos')) {
                    var targetInfo = this.locateElement(array[i].subTodos, target);
                    if (targetInfo) {
                        return targetInfo;
                    }
                }
            }
        }
    },
    showHide: function (event) {
        var targetId = event.target.closest('li').dataset.id;
        var targetInfo = this.locateElement(this.todos, targetId);

        targetInfo.todo.expand = !targetInfo.todo.expand;
        this.storeCurrentTodos();
        view.render(this.todos);

        var selector = '[data-id="' + targetId + '"]';
        document.querySelector(selector).querySelector('input').focus();
    },
    displaySigns: function (event) {
        var targetId = event.target.closest('li').dataset.id;
        var targetInfo = this.locateElement(this.todos, targetId);

        if (targetInfo.todo.hasOwnProperty('subTodos')) {
            event.target.closest('li').querySelector('img').style.opacity = 1;
        }
    },
    hideSigns: function (event) {
        var targetId = event.target.closest('li').dataset.id;
        var targetInfo = this.locateElement(this.todos, targetId);

        event.target.closest('li').querySelector('img').style.opacity = 0;
    },   
    addTodoByEnter: function (event) {
        var targetId = event.target.closest('li').dataset.id;
        var targetInfo = this.locateElement(this.todos, targetId);
        var currentLevel = targetInfo.todo.level;
        var focusId;

        if (targetInfo.todo.hasOwnProperty('subTodos') && targetInfo.todo.expand === true) {
            targetInfo.todo.subTodos.splice(0, 0, {
                id: util.uuid(),
                title: '',
                level: currentLevel + 1,
                completed: false
            });

            focusId = targetInfo.todo.subTodos[0].id;
        } else {
            var start = targetInfo.index + 1;

            targetInfo.list.splice(start, 0, {
                id: util.uuid(),
                title: '',
                level: currentLevel,
                completed: false
            });

            focusId = targetInfo.list[start].id;
        }

        this.storeCurrentTodos();
        view.render(this.todos);

        var selector = '[data-id="' + focusId + '"]';
        document.querySelector(selector).querySelector('input').focus();
    },
    addSubByDropdown: function (event) {
        //Add new child
        var targetId = event.target.closest('li').dataset.id;
        var targetInfo = this.locateElement(this.todos, targetId);
        var currentLevel = targetInfo.todo.level;
        
        if (targetInfo.todo.subTodos === undefined) {
            //add a new property to the object
            targetInfo.todo.subTodos = [{
                id: util.uuid(),
                title: '',
                level: currentLevel + 1,
                completed: false
            }];
        } else {
            targetInfo.todo.subTodos.push({
                id: util.uuid(),
                title: '',
                level: currentLevel + 1,
                completed: false
            });
        }

        //Add a new property to the element
        targetInfo.todo.expand = true;

        this.storeCurrentTodos();
        view.render(this.todos);
        
        //Focus the newly added
        var length = targetInfo.todo.subTodos.length;
        var focusId = targetInfo.todo.subTodos[length - 1].id;
        var selector = '[data-id="' + focusId + '"]';
        document.querySelector(selector).querySelector('input').focus();
    },
    update: function (event) {
        var targetId = event.target.closest('li').dataset.id;
        var targetInfo = this.locateElement(this.todos, targetId);
        var val = event.target.value;

        targetInfo.todo.title = val;
        
        this.storeCurrentTodos();
    },
    toggleCompleted: function (event) {
        var targetId = event.target.closest('li').dataset.id;
        var targetInfo = this.locateElement(this.todos, targetId);

        function loopThrough(todo) {
            todo.completed = !todo.completed;
            //set all its subTodos' complete property to its opposite too.
            if (todo.hasOwnProperty('subTodos')) {
                for (var i = 0; i < todo.subTodos.length; i++) {
                    loopThrough(todo.subTodos[i]);
                }
            }
        }

        loopThrough(targetInfo.todo);
        this.storeCurrentTodos();
        view.render(this.todos);
    },
    deleteByDropdown: function (event) {
        var targetId = event.target.closest('li').dataset.id;
        var targetInfo = this.locateElement(this.todos, targetId);
        var listLength = targetInfo.list.length;
        var currentLevel = targetInfo.todo.level;
        var focusId;

        if (listLength === 1 && currentLevel === 0) {
        //Delete the only element in the page can't delete the li, only delete the content
            targetInfo.todo.title = '';
            focusId = targetId;
        } else if (listLength === 1 && currentLevel > 0) {//Delete the only subTodo
            //Remove unnecessary properties and put its parent in focus
            var listId = event.target.closest('ul').closest('li').dataset.id;
            var listInfo = this.locateElement(this.todos, listId);
            delete listInfo.todo.subTodos;
            delete listInfo.todo.expand;
            focusId = listId;
        } else if (targetInfo.index === 0 && currentLevel === 0) {//Delete the first Todo, the following siblint will be in focus
            focusId = targetInfo.list[1].id;
            targetInfo.list.splice(targetInfo.index, 1);
        } else if (targetInfo.index === 0 && currentLevel > 0) {//Delete the first subTodo, parent will be in focus
            focusId = event.target.closest('ul').closest('li').dataset.id;
            targetInfo.list.splice(targetInfo.index, 1);
        } else {//The deleted todo is not the only child, nor is the first child. Level 0/+
            targetInfo.list.splice(targetInfo.index, 1);
            //If the silbing element in the front doesn't have subTodos or has subTodos but collapse,
            //focus the sibling element
            //If the silbing element in the front has subTodos and expand, focus the last expand child
            var sibling = targetInfo.list[targetInfo.index - 1];

            function findFocusId(object) {
                if (object.hasOwnProperty('subTodos') && object.expand === true) {
                    let len = object.subTodos.length;
                    findFocusId(object.subTodos[len - 1]);
                } else {
                    focusId = object.id;
                }
            }

            findFocusId(sibling);
        }

        this.storeCurrentTodos();
        view.render(this.todos);

        var selector = '[data-id="' + focusId + '"]';
        document.querySelector(selector).querySelector('input').focus();
    }
};

var view = {
    render: function (array) {
        var createdUl = this.prepareUl(array);
        this.updateDom(createdUl);
    },
    prepareUl: function (array) {
        var todoUl = document.createElement('ul');
        for (var i = 0; i < array.length; i++) {
            //1.Create a li for the current element
            //<li {{#if completed}}class="completed"{{/if}} data-id="{{id}}">
            var todoLi = document.createElement('li');

            todoLi.setAttribute('data-id', array[i].id);

                //<img src="image/add/minus/placeHolder.png" class="showHide/noSub">
                var icon = document.createElement('img');
                if (array[i].hasOwnProperty('subTodos') && (array[i].expand === false)) {
                    icon.src = "image/plus.png";
                    icon.classList.add("showHide");
                } else if (array[i].hasOwnProperty('subTodos') && (array[i].expand === true)) {
                    icon.src = "image/minus.png";
                    icon.classList.add("showHide");
                } else if (!array[i].hasOwnProperty('subTodos')) {
                    icon.src = "image/placeHolder.png";
                    icon.classList.add("noSub");
                }
                //icon.setAttribute("style", 'opacity: 0');
                icon.style.opacity = 0;
                    
                //<div class="dropdown">
                var dropdownDiv = document.createElement('div');
                dropdownDiv.classList.add("dropdown");

                    //<img src="image/circle.png" class="circle">
                    var circle = document.createElement('img');
                    circle.src = "image/circle.png";
                    circle.classList.add("circle");

                    //<div class="dropdown-content">
                    var contentDiv = document.createElement('div');
                    contentDiv.classList.add("dropdown-content");

                        //<p class="addSub">Add Sub Todo</p>
                        var option1 = document.createElement('p');
                        option1.classList.add("addSub");
                        option1.innerText = 'Add Sub Todo';

                        //<p class="toggleCompleted">Toggle Completed</p>
                        var option2 = document.createElement('p');
                        option2.classList.add("toggleCompleted");
                        option2.innerText = 'Toggle Completed';

                        //<p class="deletion">Delete</p>
                        var option3 = document.createElement('p');
                        option3.classList.add("deletion");
                        option3.innerText = 'Delete';

                    //append 3p to dropdown-content div
                    var children = [option1, option2, option3];
                    for (var k = 0; k < children.length; k++) {
                        contentDiv.appendChild(children[k]);
                    }

                //append circle icon and dropdown-content div to dropdown div
                dropdownDiv.appendChild(circle);
                dropdownDiv.appendChild(contentDiv);

                //<input type="text" class="edit" value="{{title}}">
                var inputBox = document.createElement("input");
                inputBox.setAttribute("type", "text");
                inputBox.classList.add("edit");
                if (array[i].completed) {
                    inputBox.classList.add("completed");
                }
                inputBox.value = array[i].title;

            //Append icon, dropdownDiv and input box to li
            todoLi.appendChild(icon);
            todoLi.appendChild(dropdownDiv);
            todoLi.appendChild(inputBox);

            //2.If the current li has a 'subTodos' property, then repeat these same steps for each child element
            if (array[i].hasOwnProperty('subTodos') && (array[i].expand === true)) {
                var subUl = this.prepareUl(array[i].subTodos);
                var style = 'padding-left: 1em; margin-left: 2em; border-left: 1px solid rgba(0,0,0,0.2);';
                subUl.setAttribute("style", style);
                todoLi.appendChild(subUl);
            }

            //3.If there is no 'subTodos', then stop
            
            //Append li to ul
            todoUl.appendChild(todoLi);
                
        }
        return todoUl;
    },
    updateDom: function (createdUl) {
        //Append the whole thing to the DOM in the end
        var container = document.getElementById('container');
        container.innerHTML = '';
        container.appendChild(createdUl);
    }
};

app.init();