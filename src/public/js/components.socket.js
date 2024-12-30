const socket = io();

const componentsList = document.getElementById("components-list");
const componentsForm = document.getElementById("components-form");
const inputComponentId = document.getElementById("input-component-id");
const btnDeleteComponent = document.getElementById("btn-delete-component");
const errorMessage = document.getElementById("error-message");

socket.on("components-list", (data) => {
    const components = data.components ?? [];
    componentsList.textContent = "";

    components.forEach((component) => {
        const listItem = document.createElement("li");
        listItem.textContent = `Id: ${component.id} - Nombre: ${component.title}`;
        componentsList.appendChild(listItem);
    });
});

componentsForm.onsubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    errorMessage.textContent = "";

    const title = formData.get("title");
    const status = formData.get("status") || "off";
    const stock = formData.get("stock");

    if (!title || !stock) {
        errorMessage.textContent = "Por favor, complete todos los campos obligatorios.";
        return;
    }

    form.reset(); 

    socket.emit("insert-component", {
        title,
        status,
        stock
    });
};

btnDeleteComponent.onclick = () => {
    const id = Number(inputComponentId.value);
    inputComponentId.value = "";
    errorMessage.textContent = "";

    if (id > 0) {
        socket.emit("delete-component", { id });
    } else {
        errorMessage.textContent = "Por favor, ingrese un ID válido.";
    }
};

socket.on("error-message", (data) => {
    errorMessage.textContent = data.message;
});
