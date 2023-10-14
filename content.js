const getIdeal = function(){
    var next_data = document.getElementById("__NEXT_DATA__");
    var nj = JSON.parse(next_data.innerText);
    return {csrf: nj.props.initialProps.csrfToken, xtoken: nj.props.initialState.common.user.xToken, nickname:  nj.props.initialState.common.user.nickname};
};

window.onload= setTimeout(async ()=>{
    try {
        getIdeal();
    } catch (error) {
        console.log("rl");
        return;
    }
    const idl = getIdeal();
    const nickname = idl.nickname;

    const css = `
    
    details {
        background-color: white;
        display: flex;
        height: 0px;
    }
    summary{
        margin-top: -10px;
        padding-bottom: 5px;
        font-size: 25px;
    }

    details > a{
        
        margin-top: 10px;
        width: 350px;
        border-radius: 20px;
        padding: 15px;
        background-color: rgb(22, 216, 163);
        text-decoration:none;
        font-size:20px;
        color:black;
        border: 2px solid black;
    }
    .nention{
        text-decoration: none;
        color: black;
    }
 
    .mention{
        background-color: rgb(22, 216, 163);
    }

    `;

    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);




    let createTarget = document.querySelector(".css-1cnivlj");

    let detailsTag = document.createElement("details");
    createTarget.prepend(detailsTag)
    let summaryTag = document.createElement("summary");
    summaryTag.textContent = "멘션";
    detailsTag.append(summaryTag)

    change()



    let result = await getData();
    result = result.data.discussList;
    let rlist = result.list

    let aTag;
    let ctime;

    let ctext;
    for (let i = 0; i < rlist.length; i++) {
        if(rlist[i].user.nickname === nickname){continue;}
        aTag = document.createElement("a");
        ctime = Math.floor((new Date() - new Date(rlist[i].created))/1000)

        if(ctime>86400){ctext = String(Math.floor(ctime/86400))+"일 전"}
        else if(ctime>3600){ctext =String(Math.floor(ctime/3600))+"시간 전"}
        else if(ctime>60){ctext = String(Math.floor(ctime/60))+"분 전"}
        else{ctext = String(Math.floor(ctime))+"초 전"}
        
        if (String(rlist[i].content).includes("@"+nickname+" ") || String(rlist[i].content).endsWith("@"+nickname)) {
            aTag.innerHTML = `<b><a class="nention" href="/profile/${rlist[i].user.id}">${rlist[i].user.nickname}</a></b>님이 멘션했어요.(<span style="font-size:20px;">${ctext}</span>)`
            aTag.href = "/community/entrystory/"+rlist[i].id
            detailsTag.append(aTag)
        }
    }

    let target = document.querySelector('.css-1urx3um');
    let observer = new MutationObserver((mutations) => {
        change()
    })
    let option = {
        attributes: true,
        childList: true,
    };
    observer.observe(target, option);


}, 500)


const change = ()=>{
    const idl = getIdeal();
    const nickname = idl.nickname;

    
    let discussList = document.querySelectorAll(".css-sy8ihv");

    if(discussList){
        for (let i = 0; i < discussList.length; i++) {
            if (!discussList[i].innerText.includes("@"+nickname+" ")) {continue;}
            discussList[i].innerHTML = discussList[i].innerHTML.replace("@"+nickname+" ", "<span class='mention'>"+"@"+nickname+"</span> ");
        }
    }
}




const getData = () => {
    const idl = getIdeal();
    const csrfToken = idl.csrf, xtoken = idl.xtoken, nickname = idl.nickname;
    const query = {"query":"\n    query SELECT_ENTRYSTORY(\n    $pageParam: PageParam\n    $query: String\n    $user: String\n    $category: String\n    $term: String\n    $prefix: String\n    $progress: String\n    $discussType: String\n    $searchType: String\n    $searchAfter: JSON\n){\n        discussList(\n    pageParam: $pageParam\n    query: $query\n    user: $user\n    category: $category\n    term: $term\n    prefix: $prefix\n    progress: $progress\n    discussType: $discussType\n    searchType: $searchType\n    searchAfter: $searchAfter\n) {\n            total\n            list {\n                \n        id\n    content\n    created\n    \n    user {\n    nickname\n    id\n    }\n    \n\n            }\n            searchAfter\n        }\n    }\n","variables":{"query":"@"+nickname+" ","category":"free","searchType":"scroll","term":"week","discussType":"entrystory","pageParam":{"display":500,"sort":"created"}}}
    
    return new Promise((resolve, reject) => {
        fetch('/graphql', {
            method: 'post',
            headers:{
                "content-type": "application/json",
                "x-client-type": "Client",
                "CSRF-Token":csrfToken,
                "x-token": xtoken
                },
            body: JSON.stringify(query)
        })
        .then(response => response.json())
        .then(data => {resolve(data);})
        .catch(error => {console.log(error);})
    });
}

