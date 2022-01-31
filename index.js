const express = require('express')
const connectToMongo = require('./db')
connectToMongo()
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors')

app.use(express.json())
app.use(cors())

app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/customerBalance', require('./routes/customerBalance'));
app.use('/api/userBalance', require('./routes/userBalance'));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Book-Keeping app listening on port ${port}`)
})