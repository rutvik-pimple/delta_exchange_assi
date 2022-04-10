import React,{ useState, useEffect, useCallback } from 'react'
import { FixedSizeList as List } from "react-window";
import { dataList } from "../constants/data";

const styles = {
  tableBorder: {
    border:'1px solid black',
    borderCollapse: 'collapse',
  },
  tableCell:{
    padding: '0.5rem 1rem',
  },
  table:{
    width:'auto',
  }
}

let ws = new WebSocket('wss://production-esocket.delta.exchange');

function ExchangeList() {
  const [currencylist, setCurrencylist] = useState({})
  const [isSocketOpen, setIsSocketOpen] = useState(false)
  useEffect(() => {
    handleSocketConnect()
    return () => {
      ws.close(1000,'Socket Closed')
    }
  }, [])

  useEffect(() => {
    // console.log('1')
    if(isSocketOpen){
      
      let symbols = dataList.map(item => item.symbol)
      let msg = JSON.stringify(
        {
          "type": "subscribe",
          "payload": {
              "channels": [
                  {
                      "name": "v2/ticker",
                      "symbols": symbols
                  },
              ]
            }
        }
      )
      ws.send(msg)
    }
      
  
  }, [currencylist,isSocketOpen])
  
  const handleSocketConnect = async() =>{
    
    ws = await new WebSocket('wss://production-esocket.delta.exchange');
    ws.onopen = () => {
      setIsSocketOpen(true)
    };
  }
  

  ws.onmessage = (message) => {
    let data = JSON.parse(message.data)
    console.log(data,"socket")
    let symbol = data.symbol
    let mark_price = data.mark_price
    setCurrencylist(prev=>({...prev,[symbol]: mark_price }))
  };
  ws.onclose = () => {
    setIsSocketOpen(false)
  }

  console.log(currencylist)
  
  const Row = useCallback(({ index, style,...say }) => {
    const { symbol, description, underlying_asset } = dataList[index] || {};
    console.log(say,index,style,"say")

    return (
      <div className="rowFlex" style={style}>
        <div style={{...styles.tableBorder,...styles.tableCell, width:'20%'}}>{symbol}</div>
        <div style={{...styles.tableBorder,...styles.tableCell,width:'45%'}}>{description}</div>
        <div style={{...styles.tableBorder,...styles.tableCell,width:'15%'}}>{underlying_asset.symbol }</div>
        <div style={{...styles.tableBorder,...styles.tableCell,width:'20%'}}>{currencylist[symbol] ? (currencylist[symbol]):(isSocketOpen ? ('Loading...'):("Can't fetch"))}</div>
      </div>
    );
  }, [currencylist]);
  
  return (
    <div>
      
          <div className="rowFlex" style={{width:1000}}>
            <div style={{...styles.tableBorder,...styles.tableCell, width:'20%'}}>Symbol</div>
            <div style={{...styles.tableBorder,...styles.tableCell, width:'45%'}}>Description</div>
            <div style={{...styles.tableBorder,...styles.tableCell, width:'15%'}}>Underlying Asset</div>
            <div style={{...styles.tableBorder,...styles.tableCell, width:'20%'}}>Mark Price</div>
          </div>
          <List
            height={650}
            width={1000}
            itemSize={50}
            itemCount={dataList.length}
          >
            {Row}
          </List>
          
    </div>
  )
}

export default ExchangeList