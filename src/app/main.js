// 文件下载模块
(function(g){
  // 字符串转ArrayBuffer
  function s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }
  function sheet2blob(sheet, sheetName) {
    sheetName = sheetName || 'Sheet1';
    let workbook = {
      SheetNames: [sheetName],
      Sheets: {}
    };
    workbook.Sheets[sheetName] = sheet;
    // 生成excel的配置项
    let wopts = {
      bookType: 'xlsx', // 要生成的文件类型
      bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
      type: 'binary'
    };
    let wbout = XLSX.write(workbook, wopts);
    let blob = new Blob([s2ab(wbout)], {type:"application/octet-stream"});
    return blob;
  }
  
  function openDownloadDialog(url, saveName = 'OST-'+new Date().toLocaleString())
  {
    if(typeof url == 'object' && url instanceof Blob)
    {
      url = URL.createObjectURL(url); // 创建blob地址
    }
    let aLink = document.createElement('a');
    aLink.href = url;
    aLink.download = saveName + '.xlsx' || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
    let event;
    if(window.MouseEvent) event = new MouseEvent('click');
    else
    {
      event = document.createEvent('MouseEvents');
      event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }
    aLink.dispatchEvent(event);
  }
  g.sheet2blob = sheet2blob
  g.openDownloadDialog = openDownloadDialog
})(window);


;(function() {
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
  function onClickDownload() {
    if(store.list.length === 0) {
      alert('无可导出数据')
      return
    }
    let aoa = [
      [
        '语区',
        '序号（一个语区一套序号，代表了展示的顺序）',
        '曲子主标题',
        '曲子副标题',
        '视频地址',
        '开始时间（单位s）',
        '持续时间（单位s）',
        '开始绝对时间'
      ],
    ];
    let link = $('.form-youtube').val()

    for(let index in store.list) {
      const data = store.list[index]
      const linkParams = data.startTime > 0 ? `?t=${data.startTime}` : ''
      if(data) {
        aoa.push([
          'zh-cn',
          index + 1,
          '',
          '',
          link + linkParams,
          data.startTime,
          data.duringTime,
          data.format
        ])
      }
    }
    let sheet = XLSX.utils.aoa_to_sheet(aoa);
    const blob = sheet2blob(sheet);
    openDownloadDialog(blob)
  }

  function handleScroll() {
    const scrollTop=$(this).scrollTop();
    $('.form')[scrollTop > 60 ? 'addClass' : 'removeClass']('form-fixed')
  }
  function addEventListener() {
    $('.btn-add').click(onClickAdd)
    $('.btn-delete').click(onClickDelete)
    $('.btn-export').click(onClickDownload)
    $(window).scroll(handleScroll)
  }
  function main() {
    addEventListener()
  }

  main()
})()