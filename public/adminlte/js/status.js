const handleClick = (link,field,id,evt) => {
   let value = $(evt).data('value') == 'active' ? 'inactive' : 'active';
   // let xhtml =  `<a href="javascript:handleClick('${url}','${id}','${status == 'active' ? 'inactive' : 'active'}')" class="rounded-circle btn btn-sm ${status == 'active' ? 'btn-warning' : 'btn-success'} status"><i class="fas fa-check"></i></a>`;
   let xhtml = `<a href="javascript:void(0)" class="rounded-circle btn btn-sm ${value == 'active' ? 'btn-success' : 'btn-warning'}" onClick="handleClick('${link}','status','${id}',this)" data-value="${value}"><i class="fas fa-check"></i></a>`;
   $.ajax({
      method: "post",
      url: link,
      data: { id,field,value},
      dataType: "html"
   })
      .done(function( msg ) {
         $('#'+id+'-status').html(xhtml);
         ntf('#'+id+'-status'+ ' a')
      });
}