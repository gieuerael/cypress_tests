/// <reference types="Cypress" />
import { search } from '../fixtures/selectors'

const urls = [Cypress.env('marketPL'), Cypress.env('marketIR')]

urls.forEach(url => {

    describe(`Tests for ${url}`, () => {

        var market = (url.includes('.pl')) ? 'marketPL' : 'marketIR'

        function openPage(urlToOpen) {
            cy.setCookiesToAvoidPopups()
            cy.visit(urlToOpen)
        }

        context('Main page console errors test', () => {

            before(() => {
                openPage(url)
            })

            it('Console errors check for main page', () => {
                cy.window().then((check) => {
                    expect(check.console.error).to.have.callCount(0);
                })
            })
        })

        xcontext('Coupon code popup test (Coupon popup is no longer visible)', () => {

            before(() => {
                openPage(url)
            })

            beforeEach(() => {
                cy.fixture('couponPopup').as('data')
            })

            it('User can click \'Show my coupon\' button', function () {
                cy.get('div#NostoPopUp')
                    .should('be.visible')

                cy.get('div.NostoForm')
                    .find('button#nostoOverlaySend')
                    .should('be.visible')
                    .and('contain.text', this.data[market]['sendButton'])
                    .click()
                    .should('not.be.visible')

                cy.get('button#nostoCouponCopyBtn')
                    .should('contain.text', this.data[market]['copyButton'])
            })

            it('User should see coupon code', function () {
                cy.get('div#nostoCoupon')
                    .should('be.visible')
                    .and('contain.text', this.data.couponCode)
            })
        })

        context('Search engine test', () => {

            before(() => {
                openPage(url)
            })

            beforeEach(function () {
                cy.fixture('search').as('data')
            })

            it('User types \'ktm\' in search input', () => {
                cy.get(search.searchInput)
                    .should('be.visible')
                    .type('ktm')
            })

            it('User should see hints under search bar', function () {
                cy.get(search.hints)
                    .should('be.visible')

                cy.get(search.hintsHeadings)
                    .then(function ($element) {
                        expect($element.eq(0)).to.contain(this.data[market]['categories'])
                        expect($element.eq(0).nextAll(search.autoCompleteItems)).to.have.length(9)
                        expect($element.eq(1)).to.contain(this.data[market].products)
                        expect($element.eq(2)).to.contain(this.data[market]['vehicle'])
                    })
            })

            it('User clicks enter button', () => {
                cy.get(search.searchInput).type('{enter}')
            })

            it('User should see search result page', () => {
                cy.get(search.resultText)
                    .should('have.text', 'ktm')

                cy.get(search.productsAmount)
                    .should('be.visible')
                    .invoke('text')
                    .then((elementText) => {
                        var productsAmount = elementText.trim().split(' ')
                        expect(parseInt(productsAmount, 10)).to.be.greaterThan(0)
                    })
            })
        })

        context('Add your bike test', () => {

            before(() => {
                openPage(url)
            })

            beforeEach(function () {
                cy.fixture('bikes').as('data')
            })

            it('User click add your bike', () => {
                cy.get('div.gtm_desktop-fmb-toggle')
                    .should('be.visible')
                    .click()
            })

            it('Only \'Select brand\' dropdown should be enabled', () => {

                cy.get('.gtm_fmb-select-brand .m-select')
                    .should('not.have.class', 'm-select--disabled')

                cy.get('.gtm_fmb-select-year .m-select')
                    .should('have.class', 'm-select--disabled')

                cy.get('.gtm_fmb-select-model .m-select')
                    .should('have.class', 'm-select--disabled')
            })

            it('User click \'Select brand\'', function () {

                cy.get('.gtm_fmb-select-brand > .m-select > .m-select__display > .a-select__display-placeholder')
                    .should('be.visible')
                    .and('have.text', this.data[market]['brand'])
                    .click()

                cy.get('.ng-star-inserted')
                    .contains('Beta')
                    .click()

                cy.get('.gtm_fmb-select-year .m-select')
                    .should('not.have.class', 'm-select--disabled')

                cy.get('.gtm_fmb-select-model .m-select')
                    .should('have.class', 'm-select--disabled')
            })

            it('User click \'Select year\'', function () {

                cy.get('.gtm_fmb-select-year > .m-select > .m-select__display > .a-select__display-placeholder')
                    .should('be.visible')
                    .and('have.text', this.data[market]['year'])
                    .click()

                cy.get('.ng-star-inserted')
                    .contains('2020')
                    .click()

                cy.get('.gtm_fmb-select-model .m-select')
                    .should('not.have.class', 'm-select--disabled')
            })

            it('User click \'Select model\'', function () {

                cy.get('.gtm_fmb-select-model > .m-select > .m-select__display > .a-select__display-placeholder')
                    .should('be.visible')
                    .and('have.text', this.data[market]['model'])
                    .click()

                cy.get('.ng-star-inserted')
                    .contains(this.data.selectedModel)
                    .click()

            })

            it('Selected bike should be added and displayed', function () {
                cy.get('.qa-fmb-model-text')
                    .should('contain.text', this.data.selectedModel)
            })
        })

        context('Add product to cart test', () => {

            before(() => {
                openPage(url + Cypress.env('product' + market.slice(-2)))
            })

            it('Click \'add to cart\' button before size choice', () => {
                cy.get('button.qa-pdp-add-to-cart-btn').click()
            })

            it('Validation error should be visible', () => {
                cy.get('div.o-variations .m-select')
                    .should('have.class', 'm-select--error')
            })

            it('Correct size choice', () => {
                cy.get('div.m-select__display').click()

                cy.get('div.a-product-variation')
                    .first()
                    .click()

                cy.get('div.o-variations .m-select')
                    .should('not.have.class', 'm-select--error')

                cy.get('div.o-variations span.ng-star-inserted')
                    .should('contain.text', 'XS 53-54cm')
            })

            it('Click \'add to cart\' button again', () => {
                cy.get('button.qa-pdp-add-to-cart-btn').click()
            })

            it('Success popup should be visible', function () {
                cy.get('.cart-loader.green-filter.ng-star-inserted', { timeout: 10000 })
                    .should('be.visible')
            })

            it('Product should be visible in the cart', () => {
                cy.get('a.qa-proceed-to-checkout')
                    .should('be.visible')

                cy.wait(3000)

                cy.get('a.qa-proceed-to-checkout')
                    .click()

                cy.get('span.qa-pli-item-name')
                    .should('contain.text', 'O\'Neal 1SRS')
            })
            // ten scenariusz z jakiegoś powodu jest niestabilny
            // objawia się to tym ze na chwile widać koszyk z produktem, a następnie stronę z informacją "Twój koszyk jest pusty"
            // Próbowałem dodatkowo czekać na request odpowiedzialny za dodanie produktu do koszyka oraz triggerować event pod buttonem "add to cart", ale nic nie pomogło
            // Strasznie mnie to trapi dlaczego to tak działa, a nie inaczej :) Jeśli znają Państwo odpowiedź to proszę podesłać na grzegorz.gorski.86@gmail.com. Będe wdzięczny
        })
    })
})
