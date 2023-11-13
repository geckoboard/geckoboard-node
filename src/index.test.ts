import Geckoboard from './index'

describe('Geckoboard', () => {
    it('has the version set correctly', () => {
        const gb = new Geckoboard('API_KEY')
        expect(gb.version).toBe('2.0.0')
    })
})