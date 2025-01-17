'use client'
import { Drawer, AppBar, Toolbar, InputBase, IconButton, Button, Box, Stack, Modal, TextField, List, ListItem, ListItemButton,ListItemText, Divider, Typography} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import ListItemIcon from '@mui/material/ListItemIcon';
import MailIcon from '@mui/icons-material/Mail';
import {styled, alpha} from '@mui/material/styles';
import { firestore } from '../../firebase';
import {useState,useEffect} from 'react';
import {collection, getDocs, query, getDoc, deleteDoc, doc, setDoc} from 'firebase/firestore';


export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [openMenu, setMenuOpen] = useState(false)
  const [itemName, setItemName] = useState('')

  const searchInventory = async(item) => {
    const snapshot = query(collection(firestore,'pantry'))
    const docs = await getDocs(snapshot)

    const inventoryList = docs.docs
      .filter((doc) => doc.id.toLowerCase() === item.toLowerCase()) 
      .map((doc) => ({
        name: doc.id,
        ...doc.data(),
    }));

    setInventory(inventoryList)
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleToggleMenu = (bool) => () => {
    setMenuOpen(bool);
  };

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

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleToggleMenu(false)}>
      <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['All mail', 'Trash', 'Spam'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

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

  useEffect(() => {
    updateInventory()
  }, [])
 
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton size="large" edge="start" color="white" aria-label="open drawer" sx={{ mr: 2 }}>
            <MenuIcon onClick = {handleToggleMenu(true)}/>
            <Drawer  open={openMenu} onClose={handleToggleMenu(false)}>{DrawerList}</Drawer>
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} onClick={updateInventory}>
            Pantry Tracker
          </Typography>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              onKeyDown = {(e) => {
                if(e.key === "Enter"){
                  searchInventory(e.target.value)
                }
              }}
            />
          </Search>
        </Toolbar>
      </AppBar>
      <Box width = "100vw" height="100vh" display="flex" justifyContent="center" alignItems="center" flexDirection="column" gap={2}>
        <Modal open={open} onClose={handleClose}>
          <Box position="absolute" top="50%" left="50%" width={400} bgcolor="white" border="2px solid #000" boxShadow={24} p={4} display="flex" flexDirection="column" gap={3} sx={{ transform: 'translate(-50%,-50%)',}}>
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
            <Typography variant='h3' color='#333'>
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

        <Button variant="contained" onClick={()=>(handleOpen())}>Add New Item</Button>

      </Box>
    </Box>
  )
}
