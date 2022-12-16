(function ($) {
    "use strict";
    //realtime clock
    var getUrlParameter = function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
    
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
    
            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
        return false;
    };

    var keyword = (getUrlParameter('keyword') != false) ? getUrlParameter('keyword').replaceAll("+"," ") : ""
    $('input[name="keyword"]').val(keyword)
    function getDateTime() {
        var now     = new Date(); 
        var year    = now.getFullYear();
        var month   = now.getMonth()+1; 
        var day     = now.getDate();
        var hour    = now.getHours();
        var minute  = now.getMinutes();
        var second  = now.getSeconds(); 
        if(month.toString().length == 1) {
             month = '0'+month;
        }
        if(day.toString().length == 1) {
             day = '0'+day;
        }   
        if(hour.toString().length == 1) {
             hour = '0'+hour;
        }
        if(minute.toString().length == 1) {
             minute = '0'+minute;
        }
        if(second.toString().length == 1) {
             second = '0'+second;
        }   
        var dateTime = hour+':'+minute+':'+second+' '+ day+'/'+month+'/'+year;   
        return dateTime;
    }



    var pathname = window.location.pathname.split("/")[1]
    $(`#navbarCollapse a[href="${pathname}"]`).addClass("active")

    const divs = document.querySelectorAll('article > div');

    document.querySelector('#cityName').addEventListener('change', () => {
    let id = event.target.value;  
    //if selectedIndex = 0, default is selected so all divs will be displayed, otherwise all divs will be removed
    divs.forEach(div =>{
        let compare = $(div).attr('id')
        if (compare == id){
            div.style.display = 'block'
        } else {
            div.style.display = 'none'
        }
    });
    //the coresponding div to the selected option will be displayed
    })
    

    





    
})(jQuery);

