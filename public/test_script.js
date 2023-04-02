function deleteCart(id){
    $.ajax({
        url:"/deleteCart",
        method:"post",
        encoded:true,
        data:{
            id:id
        }
    }).done((data)=>{
        console.log(data);
        if(data.success === true){
            window.location.reload()
        }
    })
}

function changeQty(userId,productId,price){
    const price = price
    const value = parseInt(document.getElementById(productId).value)
    $.ajax({
      url:'/changeQty',
      data:{
        user:userId,
        product:productId,
        value: value
      },
      method:'post',
      encoded:true,
    }).done((data) => {
        if(data.success){
            
            location.reload()
        }else{
            // setTimeout(()=>{
            // 	window.location.reload()		
            // },6000)	
            swal("Oops!", "Out of stock", "error");
        }
    })
}