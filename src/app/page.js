'use client'
import { AppBar, Toolbar, InputBase, IconButton, Button, Box, Stack, Modal, TextField, Typography} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import {styled, alpha} from '@mui/material/styles';
import { firestore } from '../../firebase';
import {useState,useEffect} from 'react';
import {collection, getDocs, query, getDoc, deleteDoc, doc, setDoc} from 'firebase/firestore';


export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'pantry'))
    const docs = await getDocs(snapshot)
    const inventoryList = []

    docs.forEach((doc)=>{
      inventoryList.push({
        name: doc.id,
        ...doc.data(),

      })
    })

    setInventory(inventoryList)
  }

  const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  }));
  
  const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }));
  
  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'white',
    width: '100%',
    '& .MuiInputBase-input': {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create('width'),
      [theme.breakpoints.up('sm')]: {
        width: '12ch',
        '&:focus': {
          width: '20ch',
        },
      },
    },
  }));
  
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {quantity} = docSnap.data()

      if(quantity ===1){
        await deleteDoc(docRef)
      }
      else{
        await setDoc(docRef, {quantity: quantity -1})
      }
    }
    await updateInventory()
  }

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity +1})
    }
    else {
      await setDoc(docRef, {quantity: 1})
    }
    await updateInventory()
  }

  const searchItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const itemData = docSnap.data()
    }else{
      //return No results matched your search
    }
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
 
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="white"
            aria-label="open drawer"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            Pantry Tracker
          </Typography>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              onChange = {(e) => {
                if(e.key === "Enter"){
                  setItemName(e.target.value)
                  searchItem(itemName)
                }
              }}
            />
          </Search>
        </Toolbar>
      </AppBar>
      <Box width = "100vw" height="100vh" display="flex" justifyContent="center" alignItems="center" flexDirection="column" gap={2}>
        <Modal open={open} onClose={handleClose}>
          <Box 
            position="absolute" 
            top="50%" 
            left="50%" 
            width={400} 
            bgcolor="white" 
            border="2px solid #000" 
            boxShadow={24} 
            p={4} 
            display="flex" 
            flexDirection="column" 
            gap={3} 
            sx={{ 
              transform: 'translate(-50%,-50%)',
            }}>
            <Typography variant = "h6">Add Item</Typography>
            <Stack width="100%" direction="row" spacing={2}>
              <TextField 
                variant='outlined' 
                fullWidth 
                value={itemName} 
                onChange={(e) =>{
                  setItemName(e.target.value)
                }}>
              </TextField>
              <Button variant="outlined" onClick={() => {
                  addItem(itemName)
                  setItemName('')
                  handleClose()
                }}>
              +
              </Button>
            </Stack>
          </Box>
        </Modal>

        <Box border='3px solid #333'>
          <Box width = "800px" height="100px" bgcolor="#ADD8E6" alignItems="center" display="flex" justifyContent={"center"}>
            <Typography variant='h2' color='#333'>
              Inventory Items
            </Typography>
          </Box>

          <Stack width="800px" height="300px" spacing={2} overflow="auto">
            {
              inventory.map(({name, quantity})=>(
                <Box key={name} width="100%" minHeight="150px" display="flex" justifyContent="space-between" bgColor='#f0f0f0' padding={5}>
                  <Typography variant='h5' color='#333' textAlign={'center'}>{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
                  <Typography variant='h5' color='#333' textAlign={'center'}>{quantity}</Typography>
                  <Button variant="contained" onClick={()=>(
                    removeItem(name)
                  )}>-</Button>
                  <Button variant="contained" onClick={()=>(
                    addItem(name)
                  )}>+</Button>
                </Box>
            ))}
          </Stack>
        </Box>

        <Button variant="contained" onClick={()=>(
          handleOpen()
        )}>Add New Item</Button>

      </Box>
    </Box>
  )
}
