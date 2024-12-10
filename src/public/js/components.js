const componentsList = document.getElementById("components-list");
const btnRefreshComponentsList = document.getElementById("btn-refresh-components-list");

const loadComponentsList = async () => {
    const response = await fetch("/api/components", { method: "GET" });
    const data = await response.json();
    const components = data.payload;

    componentsList.innerText = "";

    components.forEach((component) => {
        componentsList.innerHTML += `<li>Id: ${component.id} - Nombre: ${component.title}</li>`;
    });
};

btnRefreshComponentsList.addEventListener("click", () => {
    loadComponentsList();
    console.log("¡Lista recargada!");
});

loadComponentsList();