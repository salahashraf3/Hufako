const productId = req.query.id;
    const productLength = productId.length
    if(productLength != 24){
      res.redirect("/IdMismatch")
    }else{

    const data = await Product.findOne({ _id: productId });
    

    if(data == null ){
    
      res.redirect("/IdMismatch")
    }
    else{
      res.render("user/single_product", { product: data });
    }
    }