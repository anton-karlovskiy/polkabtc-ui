import React, { ReactElement, useEffect, useState } from "react";
import polkaBTCLogo from "../../assets/img/polkabtc/PolkaBTC_black.png";
import { Navbar, Nav, Image, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { StoreType } from "../types/util.types";
import * as constants from "../../constants";

type TopbarProps = {
    address?: string;
    onAccountClick: () => void;
};

export default function Topbar(props: TopbarProps): ReactElement {
    const stakedRelayer = useSelector((state: StoreType) => state.relayer);
    const [isConnected, setIsConnected] = useState(false);
    useEffect(() => {
        if (!stakedRelayer) return;

        const checkIsConnected = async () => {
            const connected = await stakedRelayer.connected();
            setIsConnected(connected);
        };
        checkIsConnected();
    }, [stakedRelayer]);

    return (
        <Navbar bg="light" expand="lg" className="border-bottom shadow-sm">
            <Navbar.Brand>
                <Link className="text-decoration-none" to="/">
                    <Image src={polkaBTCLogo} width="90" className="d-inline-block align-top" height="30" fluid />
                </Link>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    {!constants.STATIC_PAGE_ONLY && (
                        <Link className="nav-link" to="/issue">
                            Issue
                        </Link>
                    )}
                    {!constants.STATIC_PAGE_ONLY && (
                        <Link className="nav-link" to="/redeem">
                            Redeem
                        </Link>
                    )}
                    {isConnected && (
                        <Link className="nav-link" to="/staked-relayer">
                            Staked Relayer
                        </Link>
                    )}
                    <Link className="nav-link" to="/about">
                        About
                    </Link>
                </Nav>
                <Nav className="d-inline">
                    {props.address !== undefined && (
                        <Button
                            variant="outline-polkadot"
                            size="sm"
                            style={{ borderRadius: "1em" }}
                            onClick={() => props.onAccountClick()}
                        >
                            Account: {props.address.substring(0, 10)}...{props.address.substring(38)}
                        </Button>
                    )}
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}