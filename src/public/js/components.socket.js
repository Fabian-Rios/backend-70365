const socket = io();

const componentsList = document.getElementById("components-list");
const componentsForm = document.getElementById("components-form");
const inputComponentId = document.getElementById("input-component-id");
const btnDeleteComponent = document.getElementById("btn-delete-component");
const errorMessage = document.getElementById("error-message");

socket.on("components-list", (data) => {
    const components = data.components ?? [];
    componentsList.innerText = "";

    components.forEach((component) => {
        componentsList.innerHTML += `<li>Id: ${component.id} - Nombre: ${component.title}</li>`;
    });
});

componentsForm.onsubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    errorMessage.innerText = "";

    form.reset();

    socket.emit("insert-component", {
        title: formData.get("title"),
        status: formData.get("status") || "off",
        stock: formData.get("stock"),
    });
};

btnDeleteComponents.onclick = () => {
    const id = Number(inputComponentsId.value);
    inputComponentsId.value = "";
    errorMessage.innerText = "";

    if (id > 0) {
        socket.emit("delete-component", { id });
    }
};

socket.on("error-message", (data) => {
    errorMessage.innerText = data.message;
});