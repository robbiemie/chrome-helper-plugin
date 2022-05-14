(function() {
  const store = {
    list: []
  }
  function render() {
    const html = store.list.map((data, index) => {
      return `
      <div class="table-row" id="cell-${index + 1}">
        <div class="table-col" >${index + 1}</div>
        <div class="table-col">${data.startTime}</div>
        <div class="table-col">${data.duringTime}</div>
        <div class="table-col">${data.format}</div>
      </div> 
    `
    }).join('')
    $('.table-content').html(html)
  }
  function getDuringTime(val) {
    const list = val.replace(/：/g,':').replace(/\s/g,'').split(':').filter(item => item)
    let startTime = 0
    let format = ''
    let count = 0
    while(list.length) {
      const time = +list.pop()
      if(list.length <= 1 && time > 60) {
        alert('请输出正确格式时间')
        return
      }
      format = `${time < 10 ? `0${time}` : time}:${format}`
      startTime += time * Math.pow(60, count)
      count++
    }
    format = format.replace(/:$/, '')
    return {
      format,
      startTime
    }
  }
  function validate(val) {
    if(!val) {
      alert('时间不能为空')
      return
    }
    const list = val.replace(/：/g,':').replace(/\s/g,'').split(':').filter(item => item)
    if(list.length <2 || list.length > 3) {
      alert('请输出正确格式时间')
      return
    }
    let result = true

    list.forEach((time) => {
      if(isNaN(+time)) {
        result = false
        alert('请输出正确格式时间')
        return
      }
    })

    return true
  }
  function onClickAdd() {
    const val = $('.form-datetime').val()
    const total = $('.form-totaltime').val()

    if(!validate(val) || !validate(total)) {
      return
    }
    const data = getDuringTime(val)
    const totalData = getDuringTime(total)
    if(data && totalData) {
      let startTime = data.startTime
      let format = data.format
      let duringTime = totalData.startTime
      if(store.list.length) {
        const prevIndex = store.list.length-1
        const prevStartTime = store.list[prevIndex].startTime
        duringTime -= startTime
        if(startTime - prevStartTime <= 0) {
          alert('视频间隔不得小于0')
          return
        }
        store.list[prevIndex].duringTime = startTime - prevStartTime
      }
      if(duringTime > 0) {
        store.list.push({
          format,
          startTime,
          duringTime
        })
      }
      render()
    }
  }
  function onClickDelete() {
    if(store.list.length <= 0) {
      alert('列表最小长度为0')
      return
    }
    store.list.pop()
    render()
  }
  function handleScroll() {
    const scrollTop=$(this).scrollTop();
    $('.form')[scrollTop > 60 ? 'addClass' : 'removeClass']('form-fixed')
  }
  function addEventListener() {
    $('.btn-add').click(onClickAdd)
    $('.btn-delete').click(onClickDelete)
    $(window).scroll(handleScroll)
  }
  function main() {
    addEventListener()
  }
  main()
})()