function ntf(element,content='Updated!', className='success',position = 'top center') {
  $(element).notify(
    content, { position,className });
}