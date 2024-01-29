  let year = new Date().getFullYear();
  document.getElementById("copyright").innerHTML =" ©️ Copyright Connectify" + " "+ String(year);
  function addDate(){
     let day = new Date().getDay() +1 ;
     let month = new Date().getMonth() +1;
      year = new Date().getFullYear();
     return day +"/" +month + "/" + year;
  }
//    CONTROLING DIVS
let a =1;  
let b=1; 
let c=1;

    function showdiv(){
          b++;
          if(b%2==0){
            
            document.getElementById("collapseExample").setAttribute("class","collapse.show");
          }else{
            document.getElementById("collapseExample").setAttribute("class","collapse");
            
          }
        }  
        function showInput(s){
            c++;
            if(c%2==0){
            document.getElementById("editpost" +s).setAttribute("class","text");
            document.getElementById("editbutton"+s).setAttribute("class","btn-primary");
            document.getElementById("content" +s).setAttribute("class","d-none");
            }else{
                document.getElementById("editpost" +s).setAttribute("class","d-none");
            document.getElementById("editbutton" +s).setAttribute("class","d-none");
            document.getElementById("content" +s).setAttribute("class","content"+s);
            }
        }
        function closeComment(){
            a++;
            if(a%2==0){
            document.getElementById("commentsection").setAttribute("class","d-none");
          }else{
            document.getElementById("collapseExample").setAttribute("class","container");
          }
        } 