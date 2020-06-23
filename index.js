
const countries=["Select Country","Afghanistan","Albania","Algeria", "Armenia",  "Angola", "Argentina", "Australia", "Azerbaijan","Britian", "Bosnia-Herzegovina",  "Bangladeshi", "Bulgaria", "Bahrain", "Burundi", "Bolivia", "Brazil",  "Botswana",  "Canada","Cambodia", "Cayman Islands","Cape Verde", "Congo",  "Chile",  "China",  "Colombia","Croatia", "Cuba",  "Czech Republic", "Denmark", "Dominica",  "Egypt", "Eritrea", "Ethiopia",  "Georgia", "Ghana", "Gibraltar", "Gambia", "Guinea", "Guatemala",  "Honduras",  "Haiti", "Hungaria", "Indonesia", "Isreal", "India", "Iraq", "Iranian", "Iceland",  "Jamaica", "Japan", "Kenya", "Kyrgystan", "North Korean",  "Kuwait",  "Kazakhstan",  "Lebanon", "Sri Lankan", "Liberia", "Lesotho", "Libya", "Morocco",  "Macedonia", "Mongolia", "Mauritania",  "Malawi", "Mexico", "Malaysia", "Mozambique", "Namibia","Netherlands", "Nigeria", "Norwegia", "Nepal", "New Zealand", "Omani Rial", "Panama", "Peruvia", "Papua New Guinea", "Philippines", "Pakistani", "Poland", "Paragua", "Qatar", "Romania", "Serbia", "Russia", "Rwanda", "Saudi Arabia", "Seychellis", "Sudan",  "Sweden", "Singapore", "Sierra Leone", "Somalia", "South African","South Korean","Switzerland",  "Syria",  "Thailand",  "Tunisia", "Turkey", "Trinidad and Tobago", "Taiwan", "Tanzania", "Ukraine", "Uganda", "United Arab Emirate","United States", "Uruguaya", "Uzbekistan", "Vietnam" , "Yemeni", "Zambia", "Zimbabwe"]

//set default date to today
let travelDate=document.getElementById("travelDate").value //
var today = new Date();
if (Number(today.getMonth()+1)<10){
    var month ="0"+String(Number(today.getMonth()+1))
}
else{var month=today.getMonth()+1}
document.getElementById("travelDate").value =today.getFullYear()+'-'+month+'-'+today.getDate() 

//add country option 
addList()

//event listener to add trip
document.getElementById('addTrip').addEventListener('click',addTrip)

//render trips in local storage
try{
    localStorage["trips"].split(' ')
    let renderHtml=document.querySelector(".trip")
    renderHtml.innerHTML=localStorage["trips"]
}
catch (err){
    console.log('No trip Added yet')
}


function addList(){
    /*function to add list of conutres drop down */
    for(let index=0;index<countries.length;index++){
        let option=document.createElement('option')
        
        option.text = countries[index];
        option.value=countries[index];
        let select=document.getElementById('countries')
        select.appendChild(option)
    }        
}

async function getWeather(long,lat,Difference_In_Days){
        const key="d3f9e9517146401cb016976707aeef4b"
        let baseUrl='https://api.weatherbit.io/v2.0/'
        
        try{
            if (Difference_In_Days<7){
                let resWeather= await fetch(`${baseUrl}current?key=${key}&lon=${long}&lat=${lat}`)
                let respWeather= await resWeather.json()
                let description=respWeather["data"][0]["weather"]["description"]
                let temp=respWeather["data"][0]["temp"]
                return [description,temp]
            }
            else{
                let resWeather= await fetch(`${baseUrl}forecast/daily?key=${key}&lon=${long}&lat=${lat}`)
                let respWeather= await resWeather.json()
                let description=respWeather["data"][0]["description"]
                let temp=respWeather["data"][0]["temp"]
                return [description,temp]
            }      
        }
        catch{
            return ["bad Network"]
        }
        
}

async function getCoordinate(){
    let travelLocation=document.getElementById("travelCity").value
    let resp = await fetch(`http://api.geonames.org/wikipediaSearchJSON?q=${travelLocation}&maxRows=1&username=ayiamco`).catch( (error) => {
    console.log("bad network")
    })
    
    try{
        let respJson= await resp.json()
        let lat = respJson.geonames['0']['lat']
        let long =respJson.geonames['0']['lng']

        return [long,lat]   
    }
    catch(error){
        console.log('An Error occured: ',error)
        return["Error occured"]
    }
} 

async function addTrip(){
    /*get difference between todays date and travelDate*/
    let travelDate=document.getElementById("travelDate").value //
    var today = new Date();
    if (Number(today.getMonth()+1)<10){
        var month ="0"+String(Number(today.getMonth()+1))
    }
    else{var month=today.getMonth()+1}
    var dateToday = today.getFullYear()+'-'+month+'-'+today.getDate();
    let date1=new Date(dateToday)
    var date2 = new Date(travelDate);     
    // To calculate the time difference of two dates 
    var Difference_In_Time = date2.getTime() - date1.getTime(); 
    // To calculate the no. of days between two dates 
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    if(Difference_In_Days<0 || countries[document.getElementById("countries").selectedIndex]=="Select Country"){
        /* if block to change error message display content*/
        if(Difference_In_Days<0){
            document.getElementById('errorMessage').textContent="Error: Travel Date has passed."
            document.getElementById('errorMessage').style.display="block"
        }
        
        else{
            document.getElementById('errorMessage').textContent="Please Select a Country."
            document.getElementById('errorMessage').style.display="block"
        }
    }

    else{
        //get travel location coordinates
        let coord= await getCoordinate()
    
        if (coord.length==1){
            document.getElementById('errorMessage').textContent="Please Check Network and City spelling."
            document.getElementById('errorMessage').style.display="block"
            
        }
        else{
            document.getElementById('errorMessage').style.display="none"

            //get weather condition
            let weatherCondition= await getWeather(coord[0],coord[1],Difference_In_Days)
            console.log(weatherCondition)
            let weatherDesc=weatherCondition[0]
            let temp=weatherCondition[1]
            let city=document.getElementById("travelCity").value[0].toUpperCase() + document.getElementById("travelCity").value.slice(1).toLowerCase()
            
            //get location image
            let imgUrl=await getPicture()
            if(Object.keys(imgUrl)[0]=="imgUrl"){
                imgUrl=imgUrl["imgUrl"]
            }
            else{
                imgUrl=''
            }
            
            //create html element to be added to DOM
            let html=`
            <div class="trip-sidebar  my-row">
                <figure>
                    <img src="${imgUrl}" alt="Image of ${city}">
                    <figcaption>SomeWhere in ${city}.</figcaption>
                </figure>
            </div> 
            <div class="tripDescription my-row">
                <h2>My Trip To: ${city}, ${countries[document.getElementById("countries").selectedIndex]}
                    <br>Departing: ${document.getElementById("travelDate").value}
                    <hr> 
                </h2> 
                <p>Your trip to ${city} is   ${Difference_In_Days >0? "in "+Difference_In_Days +" days":"Today"}</p> 
                <p>Projected weather condition: ${weatherDesc} at ${temp}&degC </p>
                <button class="removeTrip" onclick='removeTrip(this)'>Remove Trip</button>
            </div>`
            

            let trips=document.querySelector('.trip')
            trips.innerHTML=html + trips.innerHTML
            
        
            if(String(localStorage["trips"])=="undefined"){
                localStorage['trips']=`${html}`
            }
            else{
                localStorage['trips']=`${html}${localStorage['trips']}`
            }
            document.getElementById("countries").value=countries[0]
            document.getElementById("travelCity").value=''
    }

    }

    
    
}


function removeTrip (element){
    console.log("started................" )
    let tripList= document.querySelector('.trip')
    let childs = tripList.childNodes
    console.log(childs)
    let currentTask=(element.parentElement)
    let currentTaskIndex=0
    let remainingTrips=''
    for (let child of childs){
        if(child.nodeName=="#text"){
            child.parentElement.removeChild(child)
        }
    }
    console.log("child lenght: ",childs)
    for(let index=1;index<childs.length;index +=2){
        console.log(index + ": ", childs[index])
        if (currentTask.textContent==childs[index].textContent){
            currentTaskIndex=index
            childs[index].setAttribute('class','deletedElement1')
            childs[index-1].setAttribute('class','deletedElement2')

        }
        else{
            remainingTrips+=`<div class="trip-sidebar  my-row>${String(childs[index-1].innerHTML)}</div>`
            remainingTrips+=`<div class="tripDescription my-row">${String(childs[index].innerHTML)}</div>`
            
        }
        
    }
    
    //remove deleted element 
    let currentElement=document.querySelector(`.deletedElement1`)
    currentElement.style.display="none"
    currentElement.parentElement.removeChild(currentElement)
    currentElement=document.querySelector(`.deletedElement2`)
    currentElement.style.display="none"
    currentElement.parentElement.removeChild(currentElement)

    //update the local storage
    localStorage['trips']=remainingTrips
    

}

async function getPicture(){
    const pixaBayKey='17156710-33a58338732a282e797b66cfc'
    let res=await fetch(`https://pixabay.com/api/?key=${pixaBayKey}&q=${document.querySelector('#travelCity').value}&image_type=photo`) 
    console.log('res: ',res)
    let respJson= await res.json()
    console.log(respJson)
    try{
        respJson['hits'][0]['largeImageURL']
        return { "imgUrl":respJson['hits'][1]['largeImageURL']}
    }
    catch (error){
        return {"error":error}
    }
}