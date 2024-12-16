onmessage = (e) => {
    console.log(e.data)
    postMessage({ result: 0 });
  
 };