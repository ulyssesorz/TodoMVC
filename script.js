class Model 
{
    constructor()//构造函数，初始化数据
    {
        //本地存储
        this.todos = JSON.parse(localStorage.getItem('todos')) || []
    }

    //回调函数，每次修改完数据后调用controller的
    //onTodoListChanged函数,通知view更新视图
    bindTodoListChanged(callback)
    {
        this.onTodoListChanged = callback
    }

    //回调并更新本地内存
    commit(todos)
    {
        this.onTodoListChanged(todos)
        localStorage.setItem('todos', JSON.stringify(todos))
    }

    addTodo(todoText)//添加一个todo项目
    {
        //构建一个todo，然后加入todos中
        const todo = 
        {
            id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
            text: todoText,
            complete: false,
        }
        this.todos.push(todo)
        this.commit(this.todos)
    }

    deleteTodo(id)//删除一个todo项目
    {
        //利用filter方法，把指定的id滤除
        this.todos = this.todos.filter(todo => todo.id !== id)
        this.commit(this.todos)
    }

    editTodo(id, newtext)//更改todo的文本数据
    {
        //利用map方法遍历todos，找到指定id就更新text，否则保持todo不变
        this.todos = this.todos.map(todo => todo.id === id ?
            { id: id, text: newtext, complete: todo.complete} : todo)
        this.commit(this.todos)   
    }

    toggleTodo(id)//修改todo项目的状态
    {
        //利用map找到所需todo，修改complete
        this.todos = this.todos.map(todo => todo.id === id ?
            { id: id, text: todo.text, complete: !todo.complete} : todo)
        this.commit(this.todos)
    }
}

class View 
{
    constructor() 
    {
        //获取根元素
        this.list = this.getElement('#root')

        //设置标题
        this.title = this.createElement('h1')
        this.title.textContent = 'Todos'

        //样表
        this.form = this.createElement('form')
    
        //设置输入选项
        this.input = this.createElement('input')
        this.input.type = 'text'
        this.input.placeholder = 'Add a todo item'
        this.input.name = 'todo'

        //提交按钮
        this.submitButton = this.createElement('button')
        this.submitButton.textContent = 'Submit'

        //已添加的tolo列表
        this.todoList = this.createElement('ul', 'todo-list')
        
        //构建form
        this.form.append(this.input, this.submitButton)

        //构建list
        this.list.append(this.title, this.form, this.todoList)
    
        //临时变量，用于实时修改文本
        this.temporaryTodoText = ''
        this.initLocalListeners()
    }

    createElement(tag, className)//在dom中创建新元素
    {
        const element = document.createElement(tag)
        if(className)
        {
            //如果是一个类，添加新的类名
            element.classList.add(className)
        }
        return element
    }

    getElement(selector)//在dom中获取元素
    {
        //查找css选择器
        const element = document.querySelector(selector)
        return element
    }

    //获取input的值
    get todoText()
    {
        return this.input.value
    }
    //重置input值
    resetInput()
    {
        this.input.value = ''
    }

    displayTodos(todos)//显示待办事项
    {
        //先清空todoList，为更新todoList做准备
        while(this.todoList.firstChild)
        {
            this.todoList.removeChild(this.todoList.firstChild)
        }
        
        //todos为空，显示'Empty list'
        if(todos.length === 0)
        {
            const p = this.createElement('p')
            p.textContent = 'Empty list'
            this.todoList.append(p)
        }
        //todos非空，显示每个todo事项
        else
        {
           todos.forEach(todo=>{
            //每个todo用一个li标识
            const li = this.createElement('li')
            li.id = todo.id

            //为每个todo设置复选框、文本框和删除按钮
            //添加复选框
            const checkbox = this.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.checked = todo.complete

            //添加可编辑的文本框
            const span = this.createElement("span")
            span.contentEditable = true
            span.classList.add('editable')

            //如果选择了复选框，即把todo标为complete，添加删除线
            if(todo.complete)
            {
                const strike = this.createElement('s')
                strike.textContent = todo.text
                span.append(strike)
            }
            else
            {
                span.textContent = todo.text
            }

            //添加删除按钮
            const deleteButton = this.createElement('button', 'delete')
            deleteButton.textContent = 'Delete'
            
            //把子元素纳入到主元素内
            li.append(checkbox, span, deleteButton)
            this.todoList.append(li)
           })
        }
    }

    //事件监听，若视图中发生操作（点击、回车、输入）
    //就让controller调用model的相应函数修改数据
    bindAddTodo(handler)
    {
        this.form.addEventListener('submit', event=>
        {
            event.preventDefault()
            if(this.todoText)
            {
                handler(this.todoText)
                this.resetInput()
            }
        })
    }

    bindDeleteTodo(handler)
    {
        this.todoList.addEventListener('click', event=>
        {
            if(event.target.className === 'delete')
            {
                const id = parseInt(event.target.parentElement.id)
                handler(id)
            }
        })
    }

    bindToggleTodo(handler)
    {
        this.todoList.addEventListener('change', event=>
        {
            if(event.target.type === 'checkbox')
            {
                const id = parseInt(event.target.parentElement.id)
                handler(id);
            }
        })
    }

    bindEditTodo(handler)
    {
        this.todoList.addEventListener('focusout',event=>
        {
            if(this.temporaryTodoText)
            {
                const id = parseInt(event.target.parentElement.id)
            }
            handler(id, this.temporaryTodoText)
            this.temporaryTodoText = ''
        })
    }

    //获取文本框的实时输入
    initLocalListeners()
    {
        this.todoList.addEventListener('input', event=>
        {
            if(event.target.className === 'editable')
            {
                this.temporaryTodoText = event.target.innerText
            }
        })
    }
}

class Controller {
    constructor(m, v) 
    {
        this.model = m
        this.view = v

        //绑定模型的事件监听
        this.model.bindTodoListChanged(this.onTodoListChanged)
        
        //绑定视图的事件监听
        this.view.bindAddTodo(this.handleAddTodo)
        this.view.bindDeleteTodo(this.handleDeleteTodo)
        this.view.bindToggleTodo(this.handleToggleTodo)
        this.view.bindEditTodo(this.handleEditTodo)

        //在构造函数中调用一次，显示初始todolist
        this.onTodoListChanged(this.model.todos)
    }

    //用于model调用view
    onTodoListChanged = todos=>
    {
        this.view.displayTodos(todos)
    }

    //下列函数用于view调用model：

    //修改临时值
    handleEditTodo = (id, todoText)=>
    {
        this.model.editTodo(id, todoText)
    }
    //监测输入，如有输入则添加新的todo
    handleAddTodo = todoText=>
    {
        this.model.addTodo(todoText)
    }
    //监测删除按钮
    handleDeleteTodo = id=>
    {
        this.model.deleteTodo(id)
    }
    //监测复选框
    handleToggleTodo = id=>
    {
        this.model.toggleTodo(id)
    }
}

const list = new Controller(new Model(), new View)