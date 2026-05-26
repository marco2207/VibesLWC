import { LightningElement, track } from 'lwc';

export default class LoanAmortizationVisualizer extends LightningElement {
    // Input fields with defaults
    @track loanAmount = 250000;
    @track interestRate = 4.5;
    @track termYears = 30;
    @track extraPrincipal = 0;

    // Calculated results
    @track standardMonthlyPayment = 0;
    @track newMonthlyPayment = 0;
    @track totalInterest = 0;
    @track interestSaved = 0;
    @track timeSaved = '';

    connectedCallback() {
        this.calculateAmortization();
    }

    handleLoanAmountChange(event) {
        this.loanAmount = parseFloat(event.target.value);
        this.calculateAmortization();
    }

    handleInterestRateChange(event) {
        this.interestRate = parseFloat(event.target.value);
        this.calculateAmortization();
    }

    handleTermYearsChange(event) {
        this.termYears = parseFloat(event.target.value);
        this.calculateAmortization();
    }

    handleExtraPrincipalChange(event) {
        this.extraPrincipal = parseFloat(event.target.value);
        this.calculateAmortization();
    }

    calculateAmortization() {
        // Convert annual rate to monthly and term to months
        const monthlyRate = this.interestRate / 100 / 12;
        const totalMonths = this.termYears * 12;

        // Calculate standard monthly payment (without extra principal)
        if (monthlyRate === 0) {
            this.standardMonthlyPayment = this.loanAmount / totalMonths;
        } else {
            this.standardMonthlyPayment = this.loanAmount * 
                (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                (Math.pow(1 + monthlyRate, totalMonths) - 1);
        }

        // Calculate total interest for standard payment
        const standardTotalPaid = this.standardMonthlyPayment * totalMonths;
        const standardTotalInterest = standardTotalPaid - this.loanAmount;

        // Calculate accelerated payoff with extra principal
        let balance = this.loanAmount;
        let monthsToPayoff = 0;
        let totalInterestWithExtra = 0;

        while (balance > 0 && monthsToPayoff < totalMonths * 2) { // Safety limit
            const interestPayment = balance * monthlyRate;
            totalInterestWithExtra += interestPayment;
            
            const principalPayment = this.standardMonthlyPayment - interestPayment + this.extraPrincipal;
            balance -= principalPayment;
            monthsToPayoff++;

            if (balance <= 0) {
                break;
            }
        }

        // Set results
        this.newMonthlyPayment = this.standardMonthlyPayment + this.extraPrincipal;
        this.totalInterest = totalInterestWithExtra;
        this.interestSaved = standardTotalInterest - totalInterestWithExtra;
        
        // Calculate time saved
        const monthsSaved = totalMonths - monthsToPayoff;
        const yearsSaved = Math.floor(monthsSaved / 12);
        const remainingMonths = monthsSaved % 12;
        
        if (yearsSaved > 0 && remainingMonths > 0) {
            this.timeSaved = `${yearsSaved} year${yearsSaved !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
        } else if (yearsSaved > 0) {
            this.timeSaved = `${yearsSaved} year${yearsSaved !== 1 ? 's' : ''}`;
        } else {
            this.timeSaved = `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
        }
    }

    // Getters for formatted display
    get formattedNewMonthlyPayment() {
        return this.formatCurrency(this.newMonthlyPayment);
    }

    get formattedTotalInterest() {
        return this.formatCurrency(this.totalInterest);
    }

    get formattedInterestSaved() {
        return this.formatCurrency(this.interestSaved);
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }
}