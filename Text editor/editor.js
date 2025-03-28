$(document).ready(function(){
    let optionButton = $(".option-button");
    let advancedOptionButton = $(".adv-option-button");
    let fontName = $("#fontName");
    let fontSize = $("#fontSize");
    let writingArea = $("text-input");
    let linkButton = $("#createLink");
    let alignButton = $(".align");
    let spacingButton = $(".spacing");
    let formatButton = $(".format");
    let scriptButton = $("")


    let fontList = [
        "Arial",
        "Verdana",
        "Time New Roman",
        "Garamond",
        "Georgia",
        "Courier New",
        "cursive",
    ];

    const initializer = () =>{
        highlighter(alignButton, true);
        highlighter(scriptButton, true);
        highlighter(formatButton, true);
        highlighter(scriptButton, true);

        fontList.map((value) => {
            let option = $("<option></option>").val(value).html(value);
            fontName.append(option);
        });

        for(let i = 1; i<= 7; i++){
            let option = $("<option></option>").val(i).html(i);
            fontSize.append(option);
        }

        fontSizeRef.val(3);
    }

    const modifyText = (command, deefaultUi, value) =>{
        document.execCommand(command, deefaultUi, value);
    }

    optionButton.on("click", function(){
        modifyText($(this).attr("id"), false, $(this).val());
    });
    advancedOptionButton.on("change", function(){
        modifyText($(this).attr("id", false, $(this).val()));
    });

    linkButton.on("click", function(){
    let userLink = prompt("Enter a URL");
    if(/http/i.test(userLink)){
        modifyText(linkButton.attr("id"), false, userLink);
    }else{
        userLink = "http://" + userLink
        modifyText(linkButton.attr("id"), false, userLink);
    }
    });

    const highlighter = (className, needsRemoval) => {
        className.on("click", function(){
            if(needsRemoval){
                let alreadyActive = false;
                if($(this).hasClass("active")){
                    alreadyActive = true;
                }

                highlighterRemover(className);
                if(!alreadyActive){
                    $(this).addClass("active");
                }else{
                    $(this).addClass("active");
                }
            }
        });
    }

    const highlighterRemover = (className) => {
        className.removeClass("active");
    };

    window.onload = initializer();
});
