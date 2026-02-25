// src/services/auctionService.ts

interface Auction {
    id: string;
    title: string;
    description: string;
    startingBid: number;
    currentBid: number;
    bids: Bid[];
    status: 'active' | 'ended';
}

interface Bid {
    userId: string;
    amount: number;
    timestamp: Date;
}

class AuctionService {
    private auctions: Auction[] = [];

    createAuction(title: string, description: string, startingBid: number): Auction {
        const newAuction: Auction = {
            id: this.generateId(),
            title,
            description,
            startingBid,
            currentBid: startingBid,
            bids: [],
            status: 'active',
        };
        this.auctions.push(newAuction);
        return newAuction;
    }

    placeBid(auctionId: string, userId: string, bidAmount: number): string {
        const auction = this.auctions.find(auc => auc.id === auctionId);
        if (!auction || auction.status !== 'active') {
            throw new Error('Auction not found or has ended.');
        }
        if (bidAmount <= auction.currentBid) {
            throw new Error('Bid must be higher than current bid.');
        }

        auction.bids.push({ userId, amount: bidAmount, timestamp: new Date() });
        auction.currentBid = bidAmount;
        return 'Bid placed successfully';
    }

    updateAuctionStatus(auctionId: string, status: 'active' | 'ended'): string {
        const auction = this.auctions.find(auc => auc.id === auctionId);
        if (!auction) {
            throw new Error('Auction not found.');
        }
        auction.status = status;
        return 'Auction status updated successfully';
    }

    fetchAuctionHistory(auctionId: string): Bid[] {
        const auction = this.auctions.find(auc => auc.id === auctionId);
        if (!auction) {
            throw new Error('Auction not found.');
        }
        return auction.bids;
    }

    private generateId(): string {
        // Simple ID generation (for example purposes)
        return Math.random().toString(36).substr(2, 9);
    }
}

export const auctionService = new AuctionService();
