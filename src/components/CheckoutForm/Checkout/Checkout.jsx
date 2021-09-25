import React, { useState, useEffect } from 'react'
import { Paper, Stepper, Step, StepLabel, Typography, CircularProgress, Divider, Button, cssBaseline} from '@material-ui/core';
import useStyles from './styles';
import AddressForm from '../AddressForm';
import PaymentForm from '../PaymentForm';
import { commerce } from '../../../lib/commerce';
import { Link, useHistory } from 'react-router-dom';

const steps = ['shipping address', 'Payment details'];

const Checkout = ({ cart, order, onCaptureCheckout, error, handleEmptyCart }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [checkoutToken, setcheckoutToken] = useState(null);
    const [shippingData, setShippingData] = useState({});
    const [isFinished, setIsFinished] = useState(false);
    const classes = useStyles();
    const history = useHistory();
    const nextStep = () => setActiveStep((prevActiveStep) => prevActiveStep + 1);
    const backStep = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);

    useEffect(() => {
        const generateToken = async() => {
            try {
                const token = await commerce.checkout.generateToken(cart.id, { type: 'cart' });
                //console.log("CART ID: ");
                //console.log(cart.id);
                setcheckoutToken(token);
            } catch (error) {
                // history.pushState('/');
                console.log(error);
            }
        }

        generateToken();
    }, [cart]);

    

    const next = (data) => {
        setShippingData(data);
        nextStep();
    } 

    const timeout = () =>{
        setTimeout(()=>{
            handleEmptyCart();
            setIsFinished(true);
        }, 3000)
    }

    let Confirmation = () => order.customer ? (
        <>
        <div>
            <Typography varianr="h5">
                Thank you for your purchase, {order.customer.firstname} {order.customer.lastname}
            </Typography>
            <Divider className={classes.divider} />
            <Typography variant="subtitle2" >Order ref: {order.customer_reference}</Typography>
        </div>
        <br/>
        <Button component={Link} to="/" variant="outlined" type="button" >Back to Home</Button>
        </>
    ) : isFinished ? (
        <>
        <div>
        
            <Typography varianr="h5">
                Thank you for your purchase
            </Typography>
            <Divider className={classes.divider} />
            
        </div>
        <br/>
        <Button component={Link} to="/" variant="outlined" type="button" >Back to Home</Button>
        </>
    ) : (
        <div className={classes.spinner}>
            <CircularProgress />
        </div>
    );

    if(error){
        <>
        <Typography variant="h5">Error: {error}</Typography>
        <br/>
        <Button component={Link} to="/" variant="outlined" type="button" >Back to Home</Button>
        </>
    }

    const Form = () => activeStep === 0
        ? <AddressForm checkoutToken={checkoutToken} next={next} /> 
        : <PaymentForm shippingData={shippingData} checkoutToken={checkoutToken} backStep={backStep} onCaptureCheckout={onCaptureCheckout} nextStep={nextStep} timeout={timeout} />;
    return (
        <>
        <cssBaseline />
           <div className={classes.toolbar}  /> 
           <main className={classes.layout}>
                <Paper className={classes.paper}>
                    <Typography variant="h4" align="center">Checkout</Typography>
                    <Stepper activeStep={0} className={classes.stepper} >
                        {steps.map((step)=>(
                            <Step key={step}>
                                <StepLabel>{step}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    {activeStep === steps.length ? <Confirmation/> : checkoutToken && <Form />}
                </Paper>
           </main>
        </>
    )
}


export default Checkout
