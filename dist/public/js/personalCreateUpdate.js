let collapseTitle = document.getElementById("collapse-checkbox")
console.log(collapseTitle)
function switchAdminCheckbox(){
    let dailyEntriesLabel = document.getElementById("dailyEntriesLabel")
    let dailyEntries = document.getElementById("dailyEntries")
    let adminCheck = document.getElementById("admin")
    if(adminCheck.hasAttribute("checked")){
        adminCheck.removeAttribute("checked")
        dailyEntriesLabel.classList.toggle("hidden")
    }else{
        adminCheck.setAttribute("checked", "")
        dailyEntriesLabel.classList.toggle("hidden")
        dailyEntries.setAttribute("value", "")
    }
}
collapseTitle.addEventListener("click",switchAdminCheckbox)