import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { FaUpload, FaImage, FaBox, FaUserCircle } from 'react-icons/fa';

interface Product {
    id: number;
    name: string;
    imageUrl: string;
}

const ProductUpload: React.FC = () => {
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [productName, setProductName] = useState<string>("");
    const [products, setProducts] = useState<Product[]>([]);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selfieImage, setSelfieImage] = useState<File | null>(null);
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get("http://localhost:5000/products");
            setProducts(response.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!image || !productName) return;

        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("image", image);
        formData.append("name", productName);

        try {
            const res = await axios.post("http://localhost:5000/products", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setUploadedUrl(res.data.url);
            setProductName("");
            setImage(null);
            setPreview(null);
            fetchProducts();
        } catch (error) {
            setError("Upload failed. Please try again.");
            console.error("Upload failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelfieImage(file);
            setSelfiePreview(URL.createObjectURL(file));
        }
    };

    const handleProcessImage = async () => {
        if (!selfieImage || !selectedProduct) return;

        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("selfie", selfieImage);
        formData.append("productId", selectedProduct.id.toString());

        try {
            const res = await axios.post("http://localhost:5000/products/try-on", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setProcessedImage(res.data.result_url);
            setSelfieImage(null);
            setSelfiePreview(null);
        } catch (error) {
            setError("Image processing failed. Please try again.");
            console.error("Processing failed", error);
        } finally {
            setLoading(false);
        }
    };
    const downloadImage = () => {
        if (!processedImage) return;
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = 'processed-image.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Container fluid className="bg-light min-vh-100 py-5 d-flex align-items-center custom-product-upload">
            <Container>
                <Row className="mb-5">
                    <Col className="text-center">
                        <h1 className="display-4 mb-4">Product Management</h1>
                        <p className="lead text-muted">Upload and manage your products easily</p>
                    </Col>
                </Row>

                <Row className="mb-5 justify-content-center">
                    <Col lg={8} xl={6}>
                        <Card className="border-0 shadow-lg">
                            <Card.Header className="bg-primary text-white py-3 text-center">
                                <div className="d-flex align-items-center justify-content-center">
                                    <FaUpload className="me-2" size={20} />
                                    <h4 className="mb-0">Upload New Product</h4>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-4">
                                {error && (
                                    <Alert variant="danger" className="d-flex align-items-center">
                                        <FaImage className="me-2" /> {error}
                                    </Alert>
                                )}

                                <Form>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold">Product Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter product name"
                                            value={productName}
                                            onChange={(e) => setProductName(e.target.value)}
                                            className="py-2"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold">Product Image</Form.Label>
                                        <div className="upload-area p-4 text-center border rounded bg-light">
                                            <Form.Control
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="d-none"
                                                id="fileInput"
                                            />
                                            <label htmlFor="fileInput" className="mb-0 cursor-pointer">
                                                <FaImage size={40} className="text-primary mb-3" />
                                                <p className="mb-0">Click to upload or drag and drop</p>
                                                <p className="text-muted small">Supported formats: JPG, PNG, GIF</p>
                                            </label>
                                        </div>
                                    </Form.Group>

                                    {preview && (
                                        <div className="text-center mb-4">
                                            <p className="fw-bold mb-2">Preview</p>
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="img-thumbnail shadow-sm"
                                                style={{ maxHeight: "200px", objectFit: 'contain' }}
                                            />
                                        </div>
                                    )}

                                    <div className="d-grid">
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            onClick={handleUpload}
                                            disabled={!image || !productName || loading}
                                            className="py-3"
                                        >
                                            {loading ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <FaUpload className="me-2" /> Upload Product
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="mb-5">
                    <Col>
                        <div className="d-flex align-items-center justify-content-center mb-4">
                            <FaBox className="text-primary me-2" size={24} />
                            <h2 className="mb-0">Select a Product</h2>
                        </div>
                        <Row xs={1} md={2} lg={3} xl={4} className="g-4 justify-content-center">
                            {products.map((product) => (
                                <Col key={product.id}>
                                    <Card
                                        className={`h-100 border-0 shadow-sm hover-card cursor-pointer ${selectedProduct?.id === product.id ? 'border border-primary' : ''
                                            }`}
                                        onClick={() => setSelectedProduct(product)}
                                    >
                                        <div className="card-img-wrapper">
                                            <Card.Img
                                                variant="top"
                                                src={product.imageUrl}
                                                alt={product.name}
                                                style={{
                                                    height: '250px',
                                                    objectFit: 'cover',
                                                    borderTopLeftRadius: '0.5rem',
                                                    borderTopRightRadius: '0.5rem'
                                                }}
                                            />
                                        </div>
                                        <Card.Body className="text-center p-4">
                                            <Card.Title className="h5 mb-0">{product.name}</Card.Title>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Col>
                </Row>

                {selectedProduct && (
                    <Row className="justify-content-center mb-5">
                        <Col lg={8} xl={6}>
                            <Card className="border-0 shadow-lg">
                                <Card.Header className="bg-primary text-white py-3 text-center">
                                    <div className="d-flex align-items-center justify-content-center">
                                        <FaUserCircle className="me-2" size={20} />
                                        <h4 className="mb-0">Upload Your Photo</h4>
                                    </div>
                                </Card.Header>
                                <Card.Body className="p-4">
                                    <div className="text-center mb-4">
                                        <h5>Selected Product: {selectedProduct.name}</h5>
                                        <img
                                            src={selectedProduct.imageUrl}
                                            alt={selectedProduct.name}
                                            style={{ height: '100px', objectFit: 'cover' }}
                                            className="mt-2"
                                        />
                                    </div>

                                    <Form.Group className="mb-4">
                                        <div className="upload-area p-4 text-center border rounded bg-light">
                                            <Form.Control
                                                type="file"
                                                accept="image/*"
                                                onChange={handleSelfieChange}
                                                className="d-none"
                                                id="selfieInput"
                                            />
                                            <label htmlFor="selfieInput" className="mb-0 cursor-pointer">
                                                <FaUserCircle size={40} className="text-primary mb-3" />
                                                <p className="mb-0">Upload your photo</p>
                                                <p className="text-muted small">Supported formats: JPG, PNG</p>
                                            </label>
                                        </div>
                                    </Form.Group>

                                    {selfiePreview && (
                                        <div className="text-center mb-4">
                                            <p className="fw-bold mb-2">Preview</p>
                                            <img
                                                src={selfiePreview}
                                                alt="Selfie Preview"
                                                className="img-thumbnail shadow-sm"
                                                style={{ maxHeight: "200px", objectFit: 'contain' }}
                                            />
                                        </div>
                                    )}

                                    <div className="d-grid">
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            onClick={handleProcessImage}
                                            disabled={!selfieImage || loading}
                                            className="py-3"
                                        >
                                            {loading ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <FaUpload className="me-2" /> Process Image
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}

                {processedImage && (
                    <Row className="justify-content-center">
                        <Col lg={8} xl={6}>
                            <Card className="border-0 shadow-lg">
                                <Card.Header className="bg-success text-white py-3 text-center">
                                    <h4 className="mb-0">Processed Result</h4>
                                </Card.Header>
                                <Card.Body className="p-4 text-center">
                                    <img
                                        src={processedImage}
                                        alt="Processed Result"
                                        className="img-fluid shadow-sm rounded"
                                        style={{ maxHeight: "400px" }}
                                    />
                                    <Button
                                        onClick={downloadImage}
                                        className="btn btn-outline-primary mt-4"
                                    >
                                        Download Image
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Container>
        </Container>
    );
};

export default ProductUpload;