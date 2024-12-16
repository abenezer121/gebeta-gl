/* eslint-disable no-restricted-globals */

// worker.js
self.onmessage = function (e) {
    let _data = [];
    
    
    let fetchPromises = e.data.map((item) => {
        let url = `http://localhost:8080/get-tile/${item[2]}/${item[0]}/${item[1]}`;
        return fetch(url)
            .then((data) => data.json())
            .then((jsondata) => {
               if(jsondata.data.features != null){
                
                for (let o = 0; o < jsondata.data.features.length; o++) {
                    _data.push(jsondata.data.features[o]);
                }
               }else{
                console.log("failed " , item)
                console.log("failed " , item)
                console.log("failed " , item)
                
               }
                
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    });

    
    Promise.all(fetchPromises)
        .then(() => {
          
            self.postMessage({ features: _data });
        })
        .catch((error) => {
            console.error("Error processing the fetch promises:", error);
        });
};

  